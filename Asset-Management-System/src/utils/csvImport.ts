import Papa from "papaparse";
import type { Asset, Receivable, License, AssetType } from "../types/inventory";

// Helper function to format dates to "October 15th, 2025" format
const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    // Handle various date formats
    let date: Date;

    // Check if it's already in the desired format (contains month name)
    if (
      dateString.includes("th,") ||
      dateString.includes("st,") ||
      dateString.includes("nd,") ||
      dateString.includes("rd,")
    ) {
      return dateString; // Already formatted
    }

    // Try parsing different formats
    if (dateString.includes("/")) {
      // Handle MM/DD/YYYY or M/D/YYYY format
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
    } else if (dateString.includes("-")) {
      // Handle YYYY-MM-DD format
      date = new Date(dateString);
    } else {
      // Try direct parsing
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }

    // Format to "October 15th, 2025" format
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Add ordinal suffix
    const getOrdinalSuffix = (day: number): string => {
      if (day >= 11 && day <= 13) {
        return "th";
      }
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  } catch (error) {
    console.warn("Date formatting failed for:", dateString, error);
    return dateString; // Return original if formatting fails
  }
};

// Helper function to transform asset data with date formatting and auto-generated tags
const transformAssetData = async (
  data: Record<string, unknown>[]
): Promise<Omit<Asset, "id">[]> => {
  const transformedAssets: Omit<Asset, "id">[] = [];
  const currentYear = new Date().getFullYear();

  const { getAssets, getRetrievedAssets } = await import(
    "../services/assetService"
  );
  const existingAssets = await getAssets();
  const existingRetrievedAssets = await getRetrievedAssets();

  const allSequences = [...existingAssets, ...existingRetrievedAssets]
    .map((asset) => {
      if (!asset.assetTag) return null;
      const parts = asset.assetTag.split("-");
      const sequence = parseInt(parts[parts.length - 1], 10);
      return Number.isNaN(sequence) ? null : sequence;
    })
    .filter((seq): seq is number => seq !== null);

  let nextSequenceNumber =
    allSequences.length > 0 ? Math.max(...allSequences) + 1 : 1;

  data.forEach((item) => {
    const itemType = item.type as string;
    let specificAssetType = itemType;

    if (itemType === "compute" && item.computeType) {
      specificAssetType = item.computeType as string;
    } else if (itemType === "peripheral" && item.peripheralType) {
      specificAssetType = item.peripheralType as string;
    } else if (itemType === "network" && item.networkType) {
      specificAssetType = item.networkType as string;
    }

    const year = item.deployedDate
      ? new Date(item.deployedDate as string).getFullYear()
      : currentYear;

    const generatedAssetTag = `BUA-${getTypeAbbreviation(
      specificAssetType
    )}-${year}-${nextSequenceNumber.toString().padStart(4, "0")}`;

    transformedAssets.push({
      ...item,
      assetTag: generatedAssetTag,
      type: itemType as AssetType,
      deployedDate: item.deployedDate
        ? formatDate(item.deployedDate as string)
        : "",
      warrantyExpiry: item.warrantyExpiry
        ? formatDate(item.warrantyExpiry as string)
        : "",
      ...(item.purchaseDate
        ? {
          deployedDate: formatDate(item.purchaseDate as string),
        }
        : {}),
    } as Omit<Asset, "id">);

    nextSequenceNumber += 1;
  });

  return transformedAssets;
};

// Helper function to get type abbreviation
const getTypeAbbreviation = (assetType: string): string => {
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

  return typeAbbreviations[assetType.toLowerCase()] || "ASS";
};

// Helper function to transform receivable data with date formatting
const transformReceivableData = (
  data: Record<string, unknown>[]
): Omit<Receivable, "id">[] => {
  return data.map((item) => ({
    ...item,
    // Transform date fields
    purchaseDate: item.purchaseDate
      ? formatDate(item.purchaseDate as string)
      : "",
  })) as Omit<Receivable, "id">[];
};

// Helper function to transform license data with date formatting
const transformLicenseData = (
  data: Record<string, unknown>[]
): Omit<License, "id">[] => {
  return data.map((item) => ({
    ...item,
    // Transform date fields
    expiryDate: item.expiryDate || item.expirationDate
      ? formatDate((item.expiryDate || item.expirationDate) as string)
      : "",
    assignedDate: item.assignedDate
      ? formatDate(item.assignedDate as string)
      : "",
  })) as unknown as Omit<License, "id">[];
};

export const isRowEmpty = (row: Record<string, unknown>): boolean => {
  return Object.values(row).every((value) => {
    if (typeof value === "string") return value.trim() === "";
    return value === null || value === undefined;
  });
};

export const importFromCSV = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanData = (results.data as Record<string, unknown>[]).filter(
          (row) => !isRowEmpty(row)
        ) as unknown as T[];
        resolve(cleanData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Specialized import functions with date transformation
export const importAssetsFromCSV = (
  file: File
): Promise<Omit<Asset, "id">[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const cleanData = (results.data as Record<string, unknown>[]).filter(
            (row) => !isRowEmpty(row)
          );
          const transformedData = await transformAssetData(cleanData);
          resolve(transformedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const importReceivablesFromCSV = (
  file: File
): Promise<Omit<Receivable, "id">[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanData = (results.data as Record<string, unknown>[]).filter(
          (row) => !isRowEmpty(row)
        );
        const transformedData = transformReceivableData(cleanData);
        resolve(transformedData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const importLicensesFromCSV = (
  file: File
): Promise<Omit<License, "id">[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanData = (results.data as Record<string, unknown>[]).filter(
          (row) => !isRowEmpty(row)
        );
        const transformedData = transformLicenseData(cleanData);
        resolve(transformedData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
