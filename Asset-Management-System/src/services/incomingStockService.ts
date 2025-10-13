import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../Firebase";
import type { IncomingStock } from "../types/inventory";

const COLLECTION_NAME = "incomingStock";

export const getIncomingStock = async (): Promise<IncomingStock[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IncomingStock[];
  } catch (error) {
    console.error("Error fetching incoming stock:", error);
    throw error;
  }
};

export const addIncomingStock = async (stock: Omit<IncomingStock, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...stock,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding incoming stock:", error);
    throw error;
  }
};

export const updateIncomingStock = async (
  id: string,
  stock: Partial<IncomingStock>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...stock,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating incoming stock:", error);
    throw error;
  }
};

export const deleteIncomingStock = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting incoming stock:", error);
    throw error;
  }
};

export const getIncomingStockByStatus = async (status: "incoming" | "in-use"): Promise<IncomingStock[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("status", "==", status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IncomingStock[];
  } catch (error) {
    console.error("Error fetching incoming stock by status:", error);
    throw error;
  }
};
