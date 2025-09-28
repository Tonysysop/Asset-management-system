import Papa from "papaparse";
import type { Asset, Receivable, License } from "../types/inventory";
import { generateAssetTag } from "../services/assetService";

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
  data: any[]
): Promise<Omit<Asset, "id">[]> => {
  const transformedAssets = [];

  // Get the starting sequence number for the current year
  const currentYear = new Date().getFullYear();
  const startingSequence = await getNextGlobalSequenceNumber(currentYear);

  // Process assets in order and assign sequential numbers
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    // Determine the specific asset type
    let specificAssetType = item.type;
    if (item.type === "compute" && item.computeType) {
      specificAssetType = item.computeType;
    } else if (item.type === "peripheral" && item.peripheralType) {
      specificAssetType = item.peripheralType;
    }

    const year = item.deployedDate
      ? new Date(item.deployedDate).getFullYear()
      : currentYear;

    const sequenceNumber = startingSequence + i;

    // Generate asset tag with the global sequence
    const generatedAssetTag = `BUA-${getTypeAbbreviation(
      specificAssetType
    )}-${year}-${sequenceNumber.toString().padStart(4, "0")}`;

    transformedAssets.push({
      ...item,
      assetTag: generatedAssetTag,
      type: specificAssetType,
      // Transform date fields
      deployedDate: item.deployedDate
        ? formatDate(item.deployedDate)
        : item.deployedDate,
      warrantyExpiry: item.warrantyExpiry
        ? formatDate(item.warrantyExpiry)
        : item.warrantyExpiry,
      // Handle purchaseDate if it exists
      ...(item.purchaseDate && {
        deployedDate: formatDate(item.purchaseDate),
      }),
    });
  }

  return transformedAssets;
};

// Helper function to get the next global sequence number for a year
const getNextGlobalSequenceNumber = async (year: number): Promise<number> => {
  const { getAssets } = await import("../services/assetService");
  const existingAssets = await getAssets();

  // Filter assets by year (all types)
  const sameYearAssets = existingAssets.filter((asset) => {
    const assetYear = asset.deployedDate
      ? new Date(asset.deployedDate).getFullYear()
      : new Date().getFullYear();
    return assetYear === year;
  });

  return sameYearAssets.length + 1;
};

// Helper function to get type abbreviation
const getTypeAbbreviation = (assetType: string): string => {
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

  return typeAbbreviations[assetType.toLowerCase()] || "ASS";
};

// Helper function to transform receivable data with date formatting
const transformReceivableData = (data: any[]): Omit<Receivable, "id">[] => {
  return data.map((item) => ({
    ...item,
    // Transform date fields
    purchaseDate: item.purchaseDate
      ? formatDate(item.purchaseDate)
      : item.purchaseDate,
  }));
};

// Helper function to transform license data with date formatting
const transformLicenseData = (data: any[]): Omit<License, "id">[] => {
  return data.map((item) => ({
    ...item,
    // Transform date fields
    expirationDate: item.expirationDate
      ? formatDate(item.expirationDate)
      : item.expirationDate,
    assignedDate: item.assignedDate
      ? formatDate(item.assignedDate)
      : item.assignedDate,
  }));
};

export const importFromCSV = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
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
  return new Promise(async (resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const transformedData = await transformAssetData(results.data);
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
        const transformedData = transformReceivableData(results.data);
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
        const transformedData = transformLicenseData(results.data);
        resolve(transformedData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
