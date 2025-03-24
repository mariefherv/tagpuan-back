const Item = require("../models/Item");
const ItemOrder = require("../models/ItemOrder");
const User = require("../models/User");

module.exports.createItem = async (req, res) => {
    try {
        const { name, marketplace, description, price, agricoin } = req.body;

        if (!name || !marketplace || !price || !agricoin) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        const seller_id = req.user.id;
        const user = await User.findById(seller_id);
        if (!user || !user.is_verified) {
            return res.status(403).json({ error: "Only verified users can create items" });
        }

        if (marketplace === "Consumers" && user.role !== "Admin") {
            return res.status(403).json({ error: "Only administrators can create items in the Consumers marketplace" });
        }

        if (marketplace === "Farmers" && user.role !== "Vendor" && user.role !== "Admin") {
            return res.status(403).json({ error: "Only vendors and administrators can create items in the Farmers marketplace" });
        }

        const item = await Item.create({ name, seller_id, marketplace, description, price, agricoin });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getItemsByMarket = async (req, res) => {
    try {
        const { market } = req.params;
        if (!["Farmers", "Consumers"].includes(market)) {
            return res.status(400).json({ error: "Invalid marketplace" });
        }
        
        const userRole = req.user.role;
        if (market === "Farmers" && !["Farmer", "Vendor", "Admin"].includes(userRole)) {
            return res.status(403).json({ error: "Only farmers, vendors, and administrators can access the Farmers marketplace" });
        }
        
        if (market === "Consumers" && !["Contractor", "Admin"].includes(userRole)) {
            return res.status(403).json({ error: "Only contractors and administrators can access the Consumers marketplace" });
        }
        
        const items = await Item.find({ marketplace: market });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.buyItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity, place_of_delivery, logistics, payment_method } = req.body;
        const buyer_id = req.user.id;
        
        if (!itemId || !quantity || !place_of_delivery || !logistics || !payment_method) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (!["PHP", "agricoin"].includes(payment_method)) {
            return res.status(400).json({ error: "Invalid payment method" });
        }

        const buyer = await User.findById(buyer_id);
        if (!buyer || buyer.role !== "Farmer") {
            return res.status(403).json({ error: "Only farmers can buy items" });
        }

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ error: "Item not found" });

        const seller = await User.findById(item.seller_id);
        if (!seller) return res.status(404).json({ error: "Seller not found" });

        const amount = payment_method === "agricoin" ? quantity * item.agricoin : quantity * item.price;

        if (payment_method === "agricoin") {
            if (buyer.agricoin < amount) {
                return res.status(400).json({ error: "Insufficient agricoin balance" });
            }

            // Deduct agricoin from buyer
            buyer.agricoin -= amount;
            await buyer.save();

            // Add agricoin to seller
            seller.agricoin += amount;
            await seller.save();
        }

        const order = await ItemOrder.create({
            buyer_id,
            itemId,
            amount,
            payment_method,
            place_of_delivery,
            logistics,
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// View All Orders of the User
module.exports.getUserOrders = async (req, res) => {
    try {
        const user_id = req.user.id;
        const orders = await ItemOrder.find({ buyer_id: user_id })
            .populate({ path: "item_id", select: "name seller_id" });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.cancelItemOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await ItemOrder.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only the buyer can cancel the order
        if (order.buyer_id.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized to cancel this order" });
        }

        // Only allow cancellation if the order is still pending
        if (order.status !== "Pending") {
            return res.status(400).json({ error: "Only pending orders can be canceled" });
        }

        // Update order as canceled
        const updatedOrder = await ItemOrder.findByIdAndUpdate(
            orderId,
            { canceled: true, status: "Canceled" },
            { new: true, runValidators: true }
        );

        res.json({ message: "Order has been canceled", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.confirmItemOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await ItemOrder.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only the buyer can confirm the order
        if (order.buyer_id.toString() !== userId) {
            return res.status(403).json({ error: "Only the buyer can confirm this order" });
        }

        // If the order is not delivered, prevent confirmation
        if (order.status !== "Delivered") {
            return res.status(400).json({ error: "Order must be delivered before confirmation" });
        }

        // Confirm the order and mark it as completed
        const updatedOrder = await ItemOrder.findByIdAndUpdate(
            orderId,
            { confirmed: true, completed: true },
            { new: true, runValidators: true }
        );

        res.json({ message: "Order has been confirmed and completed", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ error: "Item not found" });

        // Ensure only the seller or an admin can delete the item
        if (item.seller_id.toString() !== userId && req.user.role !== "Admin") {
            return res.status(403).json({ error: "Unauthorized to delete this item" });
        }

        // Delete the item
        await Item.findByIdAndDelete(itemId);

        // Cancel only orders with "Pending" or "Preparing" status
        await ItemOrder.updateMany(
            { item_id: itemId, status: { $in: ["Pending", "Preparing"] } },
            { $set: { status: "Canceled", canceled: true } }
        );

        res.json({ message: "Item deleted successfully. Pending and Preparing orders have been canceled." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.updateItemOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // New status to update
        const userId = req.user.id;

        const validStatuses = ["Pending", "Preparing", "On The Way", "Delivered"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const order = await ItemOrder.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only the seller of the item or admin can update the order status
        const item = await Item.findById(order.item_id);
        if (!item) {
            return res.status(400).json({ error: "Item associated with this order has been deleted." });
        }

        if (item.seller_id.toString() !== userId && req.user.role !== "Admin") {
            return res.status(403).json({ error: "Unauthorized to update order status" });
        }

        // Prevent moving directly to "Completed" unless it's confirmed
        if (status === "Completed" && !order.confirmed) {
            return res.status(400).json({ error: "Order must be confirmed before marking as completed." });
        }

        // Update order status
        const updatedOrder = await ItemOrder.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });

        res.json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

