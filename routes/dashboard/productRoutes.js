const productControllers = require("../../controllers/dashboard/productControllers");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

const router = require("express").Router();

// ✅ Add new product
router.post(
  "/product-add",
  authMiddleware,
  upload.single("image"), // If multiple images, use upload.array("images", limit)
  productControllers.add_product
);

// ✅ Get all products (with pagination, search, etc. if supported)
router.get("/product-get", authMiddleware, productControllers.get_product);

// ✅ Update product by ID
router.put(
  "/product-update/:id",
  authMiddleware,
  upload.single("image"),
  productControllers.update_product
);

// ✅ Delete product by ID
router.delete(
  "/product-delete/:id",
  authMiddleware,
  productControllers.delete_product
);

module.exports = router;
