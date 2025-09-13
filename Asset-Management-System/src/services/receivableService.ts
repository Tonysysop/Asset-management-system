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

export const addReceivable = async (receivableData: Omit<Receivable, "id">, user: string) => {
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

export const addReceivables = async (receivablesData: Omit<Receivable, "id">[], user: string) => {
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

  const changes = Object.keys(receivableData).reduce((acc, key) => {
    if (oldReceivableData[key as keyof Receivable] !== newReceivableData[key as keyof Receivable]) {
      acc.push(`${key}: '${oldReceivableData[key as keyof Receivable]}' -> '${newReceivableData[key as keyof Receivable]}'`);
    }
    return acc;
  }, [] as string[]);

  await addAction({
    user,
    actionType: "UPDATE",
    itemType: "receivable",
    itemId: id,
    timestamp: new Date(),
    details: `Updated receivable with id ${id}. Changes: ${changes.join(', ')}`,
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