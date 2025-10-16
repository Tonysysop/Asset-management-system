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
  try {
    const snapshot = await getDocs(assetsCollection);
    const assets = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Asset)
    );

    // Sort by deployed date (newest first), then by asset tag as secondary sort
    return assets.sort((a, b) => {
      // If both have deployed dates, sort by deployed date (newest first)
      if (a.deployedDate && b.deployedDate) {
        const dateA = new Date(a.deployedDate).getTime();
        const dateB = new Date(b.deployedDate).getTime();
        if (dateA !== dateB) {
          return dateB - dateA; // Newest first
        }
      }

      // If one has deployed date and other doesn't, prioritize the one with date
      if (a.deployedDate && !b.deployedDate) return -1;
      if (!a.deployedDate && b.deployedDate) return 1;

      // If neither has deployed date or they're equal, sort by asset tag
      return a.assetTag.localeCompare(b.assetTag);
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw new Error(
      "Failed to fetch assets. Please check your connection and try again."
    );
  }
};

export const generateAssetTag = async (
  assetType: string,
  assetSubtype?: string,
  deployedDate?: Date
): Promise<string> => {
  const existingAssets = await getAssets();
  const existingRetrievedAssets = await getRetrievedAssets();
  const year = deployedDate
    ? deployedDate.getFullYear()
    : new Date().getFullYear();

  // Map asset types and subtypes to abbreviations
  const typeAbbreviations: { [key: string]: string } = {
    // New structure
    compute: "COM",
    peripheral: "PER",
    network: "NET",
    // Access Point specific
    access_point: "AP",
    // Legacy types (for backward compatibility)
    laptop: "LAP",
    desktop: "DES",
    server: "SRV",
    monitor: "MON",
    printer: "PRI",
    phone: "PHO",
    tablet: "TAB",
    scanner: "SCA",
    mobile: "MOB",
    router: "ROU",
    switch: "SWI",
  };

  // Determine the abbreviation based on asset type and subtype
  let abbreviation = "ASS"; // Default fallback

  if (assetSubtype && typeAbbreviations[assetSubtype.toLowerCase()]) {
    // Use subtype abbreviation if available (e.g., access_point -> AP)
    abbreviation = typeAbbreviations[assetSubtype.toLowerCase()];
  } else if (typeAbbreviations[assetType.toLowerCase()]) {
    // Use main type abbreviation if subtype not found
    abbreviation = typeAbbreviations[assetType.toLowerCase()];
  }

  // Combine all assets (active + retrieved) to check for used sequence numbers
  const allAssets = [...existingAssets, ...existingRetrievedAssets];

  // Extract sequence numbers from ALL existing asset tags (global across all years and types)
  const sequenceNumbers = allAssets
    .map((asset) => {
      const tagParts = asset.assetTag.split("-");
      const sequencePart = tagParts[tagParts.length - 1]; // Last part should be the sequence
      const sequence = parseInt(sequencePart, 10);
      return isNaN(sequence) ? 0 : sequence;
    })
    .filter((num) => num > 0);

  // Get the next sequence number (global across all years and types)
  const nextSequence =
    sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1;

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
  try {
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
  } catch (error) {
    console.error("Error adding asset:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Failed to add asset. Please check your connection and try again."
    );
  }
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

    const actionPromises: Promise<unknown>[] = [];

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
