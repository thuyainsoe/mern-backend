const sellerControllers = require("../../controllers/dashboard/sellerControllers");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = require("express").Router();

// Get all sellers
router.get("/sellers-get", authMiddleware, sellerControllers.get_sellers);

// Get sellers by status (pending/active/deactive)
router.get(
  "/sellers-get-by-status",
  authMiddleware,
  sellerControllers.get_sellers_by_status
);

// Get single seller by ID
router.get("/seller-get/:id", authMiddleware, sellerControllers.get_seller);

// Update seller status
router.put(
  "/seller-status-update/:id",
  authMiddleware,
  sellerControllers.update_seller_status
);

module.exports = router;
