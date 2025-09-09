import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../Firebase";
import type { Receivable } from "../types/inventory";

const receivablesCollection = collection(db, "receivables");

export const getReceivables = async (): Promise<Receivable[]> => {
  const snapshot = await getDocs(receivablesCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Receivable)
  );
};

export const addReceivable = async (receivableData: Omit<Receivable, "id">) => {
  const docRef = await addDoc(receivablesCollection, receivableData);
  return { ...receivableData, id: docRef.id };
};

export const updateReceivable = async (
  id: string,
  receivableData: Partial<Receivable>
) => {
  const receivableDoc = doc(db, "receivables", id);
  await updateDoc(receivableDoc, receivableData);
};

export const deleteReceivable = async (id: string) => {
  const receivableDoc = doc(db, "receivables", id);
  await deleteDoc(receivableDoc);
};
