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
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Asset));
};

export const generateAssetTag = async (
  assetType: string,
  deployedDate?: Date
): Promise<string> => {
  const existingAssets = await getAssets();
  const year = deployedDate
    ? deployedDate.getFullYear()
    : new Date().getFullYear();

  // Map asset types to abbreviations
  const typeAbbreviations: { [key: string]: string } = {
    laptop: "LAP",
    desktop: "DES",
    server: "SRV",
    monitor: "MON",
    printer: "PRI",
    phone: "PHO",
    tablet: "TAB",
    network: "NET",
    scanner: "SCA",
    mobile: "MOB",
    router: "ROU",
    switch: "SWI",
  };

  const abbreviation = typeAbbreviations[assetType.toLowerCase()] || "ASS";

  // Filter assets by type and year
  const sameTypeAssets = existingAssets.filter((asset) => {
    const assetYear = asset.deployedDate
      ? new Date(asset.deployedDate).getFullYear()
      : new Date().getFullYear();
    return (
      asset.type.toLowerCase() === assetType.toLowerCase() && assetYear === year
    );
  });

  // Get the next sequence number
  const nextSequence = sameTypeAssets.length + 1;

  return `BUA-${abbreviation}-${year}-${nextSequence
    .toString()
    .padStart(4, "0")}`;
};

export const getRetrievedAssets = async (): Promise<RetrievedAsset[]> => {
  const snapshot = await getDocs(retrievedCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as RetrievedAsset)
  );
};

export const addAsset = async (assetData: Omit<Asset, "id">, user: string) => {
  const q = query(
    assetsCollection,
    where("assetTag", "==", assetData.assetTag)
  );
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

export const addAssets = async (
  assetsData: Omit<Asset, "id">[],
  user: string
): Promise<string[]> => {
  const existingAssets = await getAssets();
  const existingAssetTags = new Set(
    existingAssets.map((asset) => asset.assetTag)
  );
  const skippedAssetTags: string[] = [];
  const validAssets: Omit<Asset, "id">[] = [];

  // Filter out duplicates and prepare valid assets
  assetsData.forEach((asset) => {
    if (existingAssetTags.has(asset.assetTag)) {
      skippedAssetTags.push(asset.assetTag);
      return;
    }
    validAssets.push(asset);
    existingAssetTags.add(asset.assetTag);
  });

  // Process in batches of 100 to avoid Firestore limits
  const batchSize = 100;
  for (let i = 0; i < validAssets.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchAssets = validAssets.slice(i, i + batchSize);

    const actionPromises: Promise<any>[] = [];

    batchAssets.forEach((asset) => {
      const docRef = doc(assetsCollection);

      // Clean up undefined values before saving
      const cleanAsset = {
        ...asset,
        deployedDate: asset.deployedDate || "",
        warrantyExpiry: asset.warrantyExpiry || "",
        assignedUser: asset.assignedUser || "",
        department: asset.department || "",
        location: asset.location || "",
        notes: asset.notes || "",
        specifications: asset.specifications || "",
        brand: asset.brand || "",
        model: asset.model || "",
        vendor: asset.vendor || "",
        serialNumber: asset.serialNumber || "",
        status: asset.status || "in-use",
        type: asset.type || "laptop",
      };

      batch.set(docRef, cleanAsset);
      actionPromises.push(
        addAction({
          user,
          actionType: "CREATE",
          itemType: "asset",
          itemId: docRef.id,
          assetTag: asset.assetTag,
          timestamp: new Date(),
          details: `Created asset with tag ${asset.assetTag}`,
        })
      );
    });

    try {
      await batch.commit();
      // Wait for all action logs to complete
      await Promise.all(actionPromises);
    } catch (error) {
      console.error(`Error committing batch ${i / batchSize + 1}:`, error);
      throw new Error(
        `Failed to import assets in batch ${
          i / batchSize + 1
        }. Please try again.`
      );
    }
  }

  return skippedAssetTags;
};

export const updateAsset = async (
  id: string,
  assetData: Partial<Asset>,
  user: string
) => {
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
      details: `Updated asset with id ${id}. Changes: ${changes.join(", ")}`,
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
