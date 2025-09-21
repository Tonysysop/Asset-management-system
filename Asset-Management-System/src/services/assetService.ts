import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../Firebase";
import type { Asset, RetrievedAsset } from "../types/inventory";
import { addAction } from "./actionService";

const assetsCollection = collection(db, "assets");
const retrievedCollection = collection(db, "retrieved_assets");

export const getAssets = async (): Promise<Asset[]> => {
  const snapshot = await getDocs(assetsCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Asset)
  );
};

export const getRetrievedAssets = async (): Promise<RetrievedAsset[]> => {
  const snapshot = await getDocs(retrievedCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as RetrievedAsset)
  );
};

export const addAsset = async (assetData: Omit<Asset, "id">, user: string) => {
  const q = query(assetsCollection, where("assetTag", "==", assetData.assetTag));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error(`Asset with tag ${assetData.assetTag} already exists.`);
  }
  const docRef = await addDoc(assetsCollection, assetData);
  await addAction({
    user,
    actionType: "CREATE",
    itemType: "asset",
    itemId: docRef.id,
    assetTag: assetData.assetTag,
    timestamp: new Date(),
    details: `Created asset with tag ${assetData.assetTag}`,
  });
  return { ...assetData, id: docRef.id };
};

export const addAssets = async (assetsData: Omit<Asset, "id">[], user: string): Promise<string[]> => {
  const existingAssets = await getAssets();
  const existingAssetTags = new Set(existingAssets.map(asset => asset.assetTag));
  const batch = writeBatch(db);
  const skippedAssetTags: string[] = [];
  
  assetsData.forEach((asset) => {
    if (existingAssetTags.has(asset.assetTag)) {
      skippedAssetTags.push(asset.assetTag);
      return;
    }
    const docRef = doc(assetsCollection);
    batch.set(docRef, asset);
    existingAssetTags.add(asset.assetTag);
    addAction({
      user,
      actionType: "CREATE",
      itemType: "asset",
      itemId: docRef.id,
      assetTag: asset.assetTag,
      timestamp: new Date(),
      details: `Created asset with tag ${asset.assetTag}`,
    });
  });

  await batch.commit();
  return skippedAssetTags;
};

export const updateAsset = async (id: string, assetData: Partial<Asset>, user: string) => {
  const assetDocRef = doc(db, "assets", id);
  const assetDoc = await getDoc(assetDocRef);
  const oldAssetData = assetDoc.data() as Asset;
  await updateDoc(assetDocRef, assetData);
  const updatedAssetDoc = await getDoc(assetDocRef);
  const newAssetData = updatedAssetDoc.data() as Asset;

  const changes = Object.keys(assetData).reduce((acc, key) => {
    const oldValue = oldAssetData[key as keyof Asset];
    const newValue = newAssetData[key as keyof Asset];
    if (oldValue !== newValue) {
      acc.push(`${key}: '${oldValue}' -> '${newValue}'`);
    }
    return acc;
  }, [] as string[]);

  if (changes.length > 0) {
    await addAction({
      user,
      actionType: "UPDATE",
      itemType: "asset",
      itemId: id,
      assetTag: newAssetData.assetTag,
      timestamp: new Date(),
      details: `Updated asset with id ${id}. Changes: ${changes.join(', ')}`,
    });
  }
};

export const deleteAsset = async (id: string, user: string) => {
  const assetDocRef = doc(db, "assets", id);
  const assetDoc = await getDoc(assetDocRef);
  const asset = assetDoc.data() as Asset;
  await deleteDoc(assetDocRef);
  await addAction({
    user,
    actionType: "DELETE",
    itemType: "asset",
    itemId: id,
    assetTag: asset.assetTag,
    timestamp: new Date(),
    details: `Deleted asset with id ${id}`,
  });
};

export const moveAssetToRetrieved = async (
  id: string,
  retrievedData: Omit<RetrievedAsset, "id">,
  user: string
) => {
  // Add to retrieved collection
  const retrievedRef = await addDoc(retrievedCollection, retrievedData);
  // Delete from assets
  const assetDocRef = doc(db, "assets", id);
  await deleteDoc(assetDocRef);
  // Audit log
  await addAction({
    user,
    actionType: "UPDATE",
    itemType: "asset",
    itemId: id,
    assetTag: retrievedData.assetTag,
    timestamp: new Date(),
    details: `Moved asset ${retrievedData.assetTag} to retrieved on ${retrievedData.retrievedDate}`,
  });
  return { ...retrievedData, id: retrievedRef.id } as RetrievedAsset;
};

export const deleteRetrievedAsset = async (id: string, user: string) => {
  const retrievedDocRef = doc(db, "retrieved_assets", id);
  const retrievedDoc = await getDoc(retrievedDocRef);
  const retrieved = retrievedDoc.data() as RetrievedAsset;
  await deleteDoc(retrievedDocRef);
  await addAction({
    user,
    actionType: "DELETE",
    itemType: "asset",
    itemId: id,
    assetTag: retrieved?.assetTag,
    timestamp: new Date(),
    details: `Deleted retrieved asset with id ${id}`,
  });
};