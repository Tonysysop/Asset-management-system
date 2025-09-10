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
import type { License } from "../types/inventory";
import { addAction } from "./actionService";

const licensesCollection = collection(db, "licenses");

export const getLicenses = async (): Promise<License[]> => {
  const snapshot = await getDocs(licensesCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as License)
  );
};

export const addLicense = async (licenseData: Omit<License, "id">, user: string) => {
  const docRef = await addDoc(licensesCollection, licenseData);
  await addAction({
    user,
    actionType: "CREATE",
    itemType: "license",
    itemId: docRef.id,
    timestamp: new Date(),
    details: `Created license with name ${licenseData.licenseName}`,
  });
  return { ...licenseData, id: docRef.id };
};

export const addLicenses = async (licensesData: Omit<License, "id">[], user: string) => {
  const batch = writeBatch(db);
  licensesData.forEach((license) => {
    const docRef = doc(licensesCollection);
    batch.set(docRef, license);
    addAction({
      user,
      actionType: "CREATE",
      itemType: "license",
      itemId: docRef.id,
      timestamp: new Date(),
      details: `Created license with name ${license.licenseName}`,
    });
  });
  await batch.commit();
};

export const updateLicense = async (
  id: string,
  licenseData: Partial<License>,
  user: string
) => {
  const licenseDocRef = doc(db, "licenses", id);
  const licenseDoc = await getDoc(licenseDocRef);
  const oldLicenseData = licenseDoc.data() as License;
  await updateDoc(licenseDocRef, licenseData);
  const updatedLicenseDoc = await getDoc(licenseDocRef);
  const newLicenseData = updatedLicenseDoc.data() as License;

  const changes = Object.keys(licenseData).reduce((acc, key) => {
    if (oldLicenseData[key as keyof License] !== newLicenseData[key as keyof License]) {
      acc.push(`${key}: '${oldLicenseData[key as keyof License]}' -> '${newLicenseData[key as keyof License]}'`);
    }
    return acc;
  }, [] as string[]);

  await addAction({
    user,
    actionType: "UPDATE",
    itemType: "license",
    itemId: id,
    timestamp: new Date(),
    details: `Updated license with id ${id}. Changes: ${changes.join(', ')}`,
  });
};

export const deleteLicense = async (id: string, user: string) => {
  const licenseDoc = doc(db, "licenses", id);
  await deleteDoc(licenseDoc);
  await addAction({
    user,
    actionType: "DELETE",
    itemType: "license",
    itemId: id,
    timestamp: new Date(),
    details: `Deleted license with id ${id}`,
  });
};