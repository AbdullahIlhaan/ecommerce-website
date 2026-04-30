<?php

namespace App\Support;

use App\Models\Order;
use App\Models\Product;
use App\Models\ReturnRequest;
use App\Models\StockMovement;
use App\Models\User;

class InventoryManager
{
    public static function recordSale(Product $product, int $quantity, ?Order $order = null): void
    {
        $before = (int) $product->stock;
        $after = max(0, $before - $quantity);

        $product->forceFill(['stock' => $after])->save();

        self::createMovement(
            product: $product,
            type: 'sale',
            quantityChange: -$quantity,
            stockBefore: $before,
            stockAfter: $after,
            order: $order,
            reference: $order?->invoice_number ?: $order?->id,
            notes: 'Stock deducted after order placement.',
        );
    }

    public static function recordManualAdjustment(Product $product, int $newStock, ?User $user = null, ?string $notes = null): void
    {
        $before = (int) $product->stock;

        if ($before === $newStock) {
            return;
        }

        $product->forceFill(['stock' => $newStock])->save();

        self::createMovement(
            product: $product,
            type: 'manual_adjustment',
            quantityChange: $newStock - $before,
            stockBefore: $before,
            stockAfter: $newStock,
            user: $user,
            reference: $product->sku,
            notes: $notes ?: 'Stock updated manually from the dashboard.',
        );
    }

    public static function recordRestockFromReturn(Product $product, int $quantity, ReturnRequest $returnRequest, ?User $user = null): void
    {
        $before = (int) $product->stock;
        $after = $before + $quantity;

        $product->forceFill(['stock' => $after])->save();

        self::createMovement(
            product: $product,
            type: 'return_restock',
            quantityChange: $quantity,
            stockBefore: $before,
            stockAfter: $after,
            order: $returnRequest->order,
            returnRequest: $returnRequest,
            user: $user,
            reference: $returnRequest->id,
            notes: 'Inventory restored from an approved return request.',
        );
    }

    private static function createMovement(
        Product $product,
        string $type,
        int $quantityChange,
        int $stockBefore,
        int $stockAfter,
        ?Order $order = null,
        ?ReturnRequest $returnRequest = null,
        ?User $user = null,
        ?string $reference = null,
        ?string $notes = null,
    ): void {
        StockMovement::query()->create([
            'product_id' => $product->id,
            'order_id' => $order?->id,
            'return_request_id' => $returnRequest?->id,
            'user_id' => $user?->id,
            'type' => $type,
            'quantity_change' => $quantityChange,
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'reference' => $reference,
            'notes' => $notes,
        ]);
    }
}
