import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../Firebase";
import type { License } from "../types/inventory";

const licensesCollection = collection(db, "licenses");

export const getLicenses = async (): Promise<License[]> => {
  const snapshot = await getDocs(licensesCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as License)
  );
};

export const addLicense = async (licenseData: Omit<License, "id">) => {
  const docRef = await addDoc(licensesCollection, licenseData);
  return { ...licenseData, id: docRef.id };
};

export const updateLicense = async (
  id: string,
  licenseData: Partial<License>
) => {
  const licenseDoc = doc(db, "licenses", id);
  await updateDoc(licenseDoc, licenseData);
};

export const deleteLicense = async (id: string) => {
  const licenseDoc = doc(db, "licenses", id);
  await deleteDoc(licenseDoc);
};
