import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../Firebase";
import type { Consumable, ConsumableTransaction } from "../types/inventory";

const CONSUMABLES_COLLECTION = "consumables";
const CONSUMABLE_TRANSACTIONS_COLLECTION = "consumableTransactions";

// Consumables CRUD operations
export const getConsumables = async (): Promise<Consumable[]> => {
  try {
    const q = query(
      collection(db, CONSUMABLES_COLLECTION),
      orderBy("itemName")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Consumable[];
  } catch (error) {
    console.error("Error fetching consumables:", error);
    throw error;
  }
};

export const addConsumable = async (
  consumable: Omit<Consumable, "id">
): Promise<string> => {
  try {
    // Filter out undefined values
    const cleanConsumable = Object.fromEntries(
      Object.entries(consumable).filter(([value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, CONSUMABLES_COLLECTION), {
      ...cleanConsumable,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding consumable:", error);
    throw error;
  }
};

export const updateConsumable = async (
  id: string,
  consumable: Partial<Consumable>
): Promise<void> => {
  try {
    // Filter out undefined values
    const cleanConsumable = Object.fromEntries(
      Object.entries(consumable).filter(([, value]) => value !== undefined)
    );

    const docRef = doc(db, CONSUMABLES_COLLECTION, id);
    await updateDoc(docRef, {
      ...cleanConsumable,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating consumable:", error);
    throw error;
  }
};

export const deleteConsumable = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, CONSUMABLES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting consumable:", error);
    throw error;
  }
};

export const getConsumablesByCategory = async (
  category: string
): Promise<Consumable[]> => {
  try {
    const q = query(
      collection(db, CONSUMABLES_COLLECTION),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Consumable[];
  } catch (error) {
    console.error("Error fetching consumables by category:", error);
    throw error;
  }
};

export const getLowStockConsumables = async (): Promise<Consumable[]> => {
  try {
    const q = query(collection(db, CONSUMABLES_COLLECTION));
    const querySnapshot = await getDocs(q);
    const consumables = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Consumable[];

    // Filter low stock items on the client side since Firestore doesn't support complex queries
    return consumables.filter(
      (item) => item.currentQuantity <= item.reorderPoint
    );
  } catch (error) {
    console.error("Error fetching low stock consumables:", error);
    throw error;
  }
};

// Consumable Transactions CRUD operations
export const getConsumableTransactions = async (): Promise<
  ConsumableTransaction[]
> => {
  try {
    const q = query(
      collection(db, CONSUMABLE_TRANSACTIONS_COLLECTION),
      orderBy("transactionDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ConsumableTransaction[];
  } catch (error) {
    console.error("Error fetching consumable transactions:", error);
    throw error;
  }
};

export const addConsumableTransaction = async (
  transaction: Omit<ConsumableTransaction, "id">
): Promise<string> => {
  try {
    // Filter out undefined values
    const cleanTransaction = Object.fromEntries(
      Object.entries(transaction).filter(([value]) => value !== undefined)
    );

    const docRef = await addDoc(
      collection(db, CONSUMABLE_TRANSACTIONS_COLLECTION),
      {
        ...cleanTransaction,
        createdAt: new Date().toISOString(),
      }
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding consumable transaction:", error);
    throw error;
  }
};

export const getConsumableTransactionsByConsumable = async (
  consumableId: string
): Promise<ConsumableTransaction[]> => {
  try {
    const q = query(
      collection(db, CONSUMABLE_TRANSACTIONS_COLLECTION),
      where("consumableId", "==", consumableId),
      orderBy("transactionDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ConsumableTransaction[];
  } catch (error) {
    console.error(
      "Error fetching consumable transactions by consumable:",
      error
    );
    throw error;
  }
};

export const getConsumableTransactionsByType = async (
  transactionType: "receive" | "issue"
): Promise<ConsumableTransaction[]> => {
  try {
    const q = query(
      collection(db, CONSUMABLE_TRANSACTIONS_COLLECTION),
      where("transactionType", "==", transactionType),
      orderBy("transactionDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ConsumableTransaction[];
  } catch (error) {
    console.error("Error fetching consumable transactions by type:", error);
    throw error;
  }
};

// Complex operations that involve both consumables and transactions
export const receiveConsumableStock = async (
  consumableId: string,
  quantity: number,
  unitCost: number,
  reference?: string,
  notes?: string
): Promise<void> => {
  try {
    // Get current consumable to calculate new quantity
    const consumableRef = doc(db, CONSUMABLES_COLLECTION, consumableId);
    const consumableDoc = await getDoc(consumableRef);

    if (!consumableDoc.exists()) {
      throw new Error("Consumable not found");
    }

    const currentConsumable = consumableDoc.data() as Consumable;
    const newQuantity = currentConsumable.currentQuantity + quantity;

    const batch = writeBatch(db);

    // Add transaction record
    const transactionRef = doc(
      collection(db, CONSUMABLE_TRANSACTIONS_COLLECTION)
    );
    const transaction: Omit<ConsumableTransaction, "id"> = {
      consumableId,
      consumableName: currentConsumable.itemName,
      transactionType: "receive",
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
      transactionDate: new Date().toISOString().split("T")[0],
      issuedBy: "store@buagroup.com", // Current user
      ...(reference && { reference }),
      ...(notes && { notes }),
    };

    // Filter out undefined values
    const cleanTransaction = Object.fromEntries(
      Object.entries(transaction).filter(([value]) => value !== undefined)
    );

    batch.set(transactionRef, {
      ...cleanTransaction,
      createdAt: new Date().toISOString(),
    });

    // Update consumable stock
    batch.update(consumableRef, {
      currentQuantity: newQuantity,
      totalReceived: currentConsumable.totalReceived + quantity,
      lastReceivedDate: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error receiving consumable stock:", error);
    throw error;
  }
};

export const issueConsumableStock = async (
  consumableId: string,
  quantity: number,
  issuedTo: string,
  department?: string,
  reason?: string,
  reference?: string,
  notes?: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Get current consumable to calculate new quantity
    const consumableRef = doc(db, CONSUMABLES_COLLECTION, consumableId);
    const consumableDoc = await getDoc(consumableRef);

    if (!consumableDoc.exists()) {
      throw new Error("Consumable not found");
    }

    const currentConsumable = consumableDoc.data() as Consumable;
    const newQuantity = currentConsumable.currentQuantity - quantity;

    if (newQuantity < 0) {
      throw new Error("Insufficient stock");
    }

    // Add transaction record
    const transactionRef = doc(
      collection(db, CONSUMABLE_TRANSACTIONS_COLLECTION)
    );
    const transaction: Omit<ConsumableTransaction, "id"> = {
      consumableId,
      consumableName: currentConsumable.itemName,
      transactionType: "issue",
      quantity,
      unitCost: currentConsumable.unitCost,
      totalCost: quantity * currentConsumable.unitCost,
      transactionDate: new Date().toISOString().split("T")[0],
      issuedTo,
      issuedBy: "store@buagroup.com", // Current user
      ...(department && { department }),
      ...(reason && { reason }),
      ...(reference && { reference }),
      ...(notes && { notes }),
    };

    // Filter out undefined values
    const cleanTransaction = Object.fromEntries(
      Object.entries(transaction).filter(([value]) => value !== undefined)
    );

    batch.set(transactionRef, {
      ...cleanTransaction,
      createdAt: new Date().toISOString(),
    });

    // Update consumable stock
    batch.update(consumableRef, {
      currentQuantity: newQuantity,
      totalIssued: currentConsumable.totalIssued + quantity,
      lastIssuedDate: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error issuing consumable stock:", error);
    throw error;
  }
};

// Helper function to create a new consumable with initial stock
export const createConsumableWithStock = async (
  consumable: Omit<Consumable, "id">,
  initialQuantity: number,
  reference?: string,
  notes?: string
): Promise<string> => {
  try {
    const batch = writeBatch(db);

    // Add consumable
    const consumableRef = doc(collection(db, CONSUMABLES_COLLECTION));

    // Filter out undefined values from consumable
    const cleanConsumable = Object.fromEntries(
      Object.entries(consumable).filter(([value]) => value !== undefined)
    );

    batch.set(consumableRef, {
      ...cleanConsumable,
      currentQuantity: initialQuantity,
      totalReceived: initialQuantity,
      totalIssued: 0,
      lastReceivedDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add initial receive transaction
    const transactionRef = doc(
      collection(db, CONSUMABLE_TRANSACTIONS_COLLECTION)
    );
    const transaction: Omit<ConsumableTransaction, "id"> = {
      consumableId: consumableRef.id,
      consumableName: consumable.itemName,
      transactionType: "receive",
      quantity: initialQuantity,
      unitCost: consumable.unitCost,
      totalCost: initialQuantity * consumable.unitCost,
      transactionDate: new Date().toISOString().split("T")[0],
      issuedBy: "store@buagroup.com", // Current user
      ...(reference && { reference }),
      ...(notes && { notes }),
    };

    // Filter out undefined values
    const cleanTransaction = Object.fromEntries(
      Object.entries(transaction).filter(([value]) => value !== undefined)
    );

    batch.set(transactionRef, {
      ...cleanTransaction,
      createdAt: new Date().toISOString(),
    });

    await batch.commit();
    return consumableRef.id;
  } catch (error) {
    console.error("Error creating consumable with stock:", error);
    throw error;
  }
};
