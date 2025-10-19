const productControllers = require("../../controllers/dashboard/productControllers");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

const router = require("express").Router();

router.post(
  "/product-add",
  authMiddleware,
  upload.array("images", 6),
  productControllers.add_product
);

router.get("/product-get", authMiddleware, productControllers.get_products);

router.get("/product-get/:id", authMiddleware, productControllers.get_product);

router.put(
  "/product-update/:id",
  authMiddleware,
  upload.array("images", 6),
  productControllers.update_product
);

router.delete(
  "/product-delete/:id",
  authMiddleware,
  productControllers.delete_product
);

router.put(
  "/product-image-delete",
  authMiddleware,
  productControllers.delete_product_image
);

module.exports = router;
