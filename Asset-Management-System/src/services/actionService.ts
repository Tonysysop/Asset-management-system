import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../Firebase";
import type { Action } from "../types/inventory";

const actionsCollection = collection(db, "actions");

export const addAction = async (actionData: Omit<Action, "id">) => {
  const docRef = await addDoc(actionsCollection, actionData);
  return { ...actionData, id: docRef.id };
};

export const getActions = async (): Promise<Action[]> => {
  const q = query(actionsCollection, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id, timestamp: doc.data().timestamp.toDate() } as Action)
  );
};