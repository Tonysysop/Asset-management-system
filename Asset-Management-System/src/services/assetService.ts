import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../Firebase";
import type { Asset } from "../types/inventory";

const assetsCollection = collection(db, "assets");

export const getAssets = async (): Promise<Asset[]> => {
  const snapshot = await getDocs(assetsCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Asset)
  );
};

export const addAsset = async (assetData: Omit<Asset, "id">) => {
  const docRef = await addDoc(assetsCollection, assetData);
  return { ...assetData, id: docRef.id };
};

export const updateAsset = async (id: string, assetData: Partial<Asset>) => {
  const assetDoc = doc(db, "assets", id);
  await updateDoc(assetDoc, assetData);
};

export const deleteAsset = async (id: string) => {
  const assetDoc = doc(db, "assets", id);
  await deleteDoc(assetDoc);
};
