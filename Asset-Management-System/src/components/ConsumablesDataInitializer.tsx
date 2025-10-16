import { useEffect } from "react";
import { useConsumablesManagement } from "../hooks/useConsumables";
import type { Consumable } from "../types/inventory";

// Sample consumables data for testing
const sampleConsumables: Omit<Consumable, "id">[] = [
  {
    itemName: "USB-C Cable",
    category: "cables",
    description: "High-speed USB-C cable for data transfer and charging",
    currentQuantity: 50,
    reorderPoint: 10,
    unitCost: 2500,
    supplier: "Tech Supplies Ltd",
    lastReceivedDate: "2024-01-15",
    totalReceived: 50,
    totalIssued: 0,
  },
  {
    itemName: "Wireless Mouse",
    category: "peripherals",
    description: "Ergonomic wireless optical mouse",
    currentQuantity: 25,
    reorderPoint: 5,
    unitCost: 8500,
    supplier: "Peripheral Pro",
    lastReceivedDate: "2024-01-10",
    totalReceived: 25,
    totalIssued: 0,
  },
  {
    itemName: "HDMI Cable",
    category: "cables",
    description: "High-definition multimedia interface cable",
    currentQuantity: 8,
    reorderPoint: 15,
    unitCost: 3500,
    supplier: "Cable Solutions",
    lastReceivedDate: "2024-01-05",
    totalReceived: 8,
    totalIssued: 0,
  },
  {
    itemName: "Wireless Keyboard",
    category: "peripherals",
    description: "Compact wireless keyboard with USB receiver",
    currentQuantity: 3,
    reorderPoint: 8,
    unitCost: 12000,
    supplier: "Peripheral Pro",
    lastReceivedDate: "2024-01-08",
    totalReceived: 3,
    totalIssued: 0,
  },
  {
    itemName: "Ethernet Cable",
    category: "networking",
    description: "Cat6 Ethernet cable for network connections",
    currentQuantity: 30,
    reorderPoint: 10,
    unitCost: 1800,
    supplier: "Network Solutions",
    lastReceivedDate: "2024-01-12",
    totalReceived: 30,
    totalIssued: 0,
  },
];

interface ConsumablesDataInitializerProps {
  children: React.ReactNode;
}

const ConsumablesDataInitializer: React.FC<ConsumablesDataInitializerProps> = ({
  children,
}) => {
  const { consumables, createConsumableWithStock, isLoadingConsumables } =
    useConsumablesManagement();

  useEffect(() => {
    // Only initialize if we have no consumables and we're not loading
    if (!isLoadingConsumables && consumables.length === 0) {
      console.log("Initializing sample consumables data...");

      // Add sample consumables one by one
      sampleConsumables.forEach(async (consumable) => {
        try {
          await createConsumableWithStock({
            consumable,
            initialQuantity: consumable.currentQuantity,
            supplier: consumable.supplier,
            notes: consumable.notes,
          });
          console.log(`Added sample consumable: ${consumable.itemName}`);
        } catch (error) {
          console.error(
            `Error adding sample consumable ${consumable.itemName}:`,
            error
          );
        }
      });
    }
  }, [consumables.length, isLoadingConsumables, createConsumableWithStock]);

  return <>{children}</>;
};

export default ConsumablesDataInitializer;
