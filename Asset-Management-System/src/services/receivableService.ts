import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../Firebase";
import type { Receivable } from "../types/inventory";
import { addAction } from "./actionService";

const receivablesCollection = collection(db, "receivables");

export const getReceivables = async (): Promise<Receivable[]> => {
  const snapshot = await getDocs(receivablesCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Receivable)
  );
};

export const addReceivable = async (
  receivableData: Omit<Receivable, "id">,
  user: string
) => {
  const docRef = await addDoc(receivablesCollection, receivableData);
  await addAction({
    user,
    actionType: "CREATE",
    itemType: "receivable",
    itemId: docRef.id,
    timestamp: new Date(),
    details: `Created receivable with name ${receivableData.itemName}`,
  });
  return { ...receivableData, id: docRef.id };
};

export const addReceivables = async (
  receivablesData: Omit<Receivable, "id">[],
  user: string
) => {
  const batch = writeBatch(db);
  receivablesData.forEach((receivable) => {
    const docRef = doc(receivablesCollection);
    batch.set(docRef, receivable);
    addAction({
      user,
      actionType: "CREATE",
      itemType: "receivable",
      itemId: docRef.id,
      timestamp: new Date(),
      details: `Created receivable with name ${receivable.itemName}`,
    });
  });
  await batch.commit();
};

export const updateReceivable = async (
  id: string,
  receivableData: Partial<Receivable>,
  user: string
) => {
  const receivableDocRef = doc(db, "receivables", id);
  const receivableDoc = await getDoc(receivableDocRef);
  const oldReceivableData = receivableDoc.data() as Receivable;
  await updateDoc(receivableDocRef, receivableData);
  const updatedReceivableDoc = await getDoc(receivableDocRef);
  const newReceivableData = updatedReceivableDoc.data() as Receivable;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value
          .map((item) =>
            typeof item === "object" && item !== null
              ? `{${Object.entries(item)
                  .map(([k, v]) => `${k}: ${formatValue(v)}`)
                  .join(", ")}}`
              : formatValue(item)
          )
          .join(", ");
      }
      return `{${Object.entries(value)
        .map(([k, v]) => `${k}: ${formatValue(v)}`)
        .join(", ")}}`;
    }
    return String(value);
  };

  const changes = Object.keys(receivableData).reduce((acc, key) => {
    const oldValue = oldReceivableData[key as keyof Receivable];
    const newValue = newReceivableData[key as keyof Receivable];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      acc.push(`${key}: ${formatValue(oldValue)} -> ${formatValue(newValue)}`);
    }
    return acc;
  }, [] as string[]);

  // Create a more informative details message
  let detailsMessage = `Updated receivable "${oldReceivableData.itemName}" (ID: ${id})`;

  // Check if assignedUsers field was actually changed
  const assignedUsersChanged = changes.some((change) =>
    change.startsWith("assignedUsers:")
  );

  if (assignedUsersChanged) {
    const oldUsers = oldReceivableData.assignedUsers || [];
    const newUsers = receivableData.assignedUsers || [];

    if (oldUsers.length === 0 && newUsers.length > 0) {
      // Adding users
      detailsMessage += `. Assigned ${newUsers.length} user(s): ${newUsers
        .map((user) => `${user.name} (Qty: ${user.quantityAssigned})`)
        .join(", ")}`;
    } else if (oldUsers.length > 0 && newUsers.length === 0) {
      // Removing all users
      detailsMessage += `. Removed all user assignments`;
    } else {
      // Updating users
      detailsMessage += `. Updated user assignments`;
      if (changes.length > 1) {
        detailsMessage += `. Other changes: ${changes
          .filter((c) => !c.startsWith("assignedUsers:"))
          .join(", ")}`;
      }
    }
  } else {
    // Regular field changes (no assignedUsers changes)
    detailsMessage += `. Changes: ${changes.join(", ")}`;
  }

  await addAction({
    user,
    actionType: "UPDATE",
    itemType: "receivable",
    itemId: id,
    timestamp: new Date(),
    details: detailsMessage,
  });
};

export const deleteReceivable = async (id: string, user: string) => {
  const receivableDoc = doc(db, "receivables", id);
  await deleteDoc(receivableDoc);
  await addAction({
    user,
    actionType: "DELETE",
    itemType: "receivable",
    itemId: id,
    timestamp: new Date(),
    details: `Deleted receivable with id ${id}`,
  });
};
