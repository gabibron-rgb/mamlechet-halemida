import { supabase } from './supabaseClient';
import type { InventoryEntry } from '../store/useGameStore';

type SellInventoryRpcRow = {
  new_points: number | string | null;
  new_inventory: unknown;
};

export type SellInventoryResult =
  | {
      ok: true;
      points: number;
      inventory: InventoryEntry[];
    }
  | { ok: false; message: string };

export async function sellStudentInventoryItem(input: {
  studentId: string;
  inventoryIndex: number;
  expectedItemId: string;
  refundPoints: number;
}): Promise<SellInventoryResult> {
  const { data, error } = await supabase
    .rpc('student_sell_inventory_item', {
      p_student_id: input.studentId,
      p_inventory_index: input.inventoryIndex,
      p_expected_item_id: input.expectedItemId,
      p_refund_points: Math.max(0, Math.round(input.refundPoints)),
    })
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('Error selling inventory item:', error);
    return {
      ok: false,
      message: 'המכירה לא נשמרה. נסה/י שוב.',
    };
  }

  const row = data as SellInventoryRpcRow;

  return {
    ok: true,
    points: Number(row.new_points ?? 0),
    inventory: Array.isArray(row.new_inventory)
      ? (row.new_inventory as InventoryEntry[])
      : [],
  };
}
