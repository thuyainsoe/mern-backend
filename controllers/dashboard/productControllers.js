const { responseReturn } = require("../../utiles/response");
const cloudinary = require("cloudinary").v2;
const productModel = require("../../models/productModel");

class productController {
  add_product = async (req, res) => {
    try {
      const { id: sellerId } = req;
      let { name, brand, category, stock, price, discount, description } =
        req.body;
      const images = req.files;

      // Trim and create slug from product name
      name = name.trim();
      const slug = name.split(" ").join("-");

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        let imageUrls = [];

        // Upload multiple images to Cloudinary
        if (images && images.length > 0) {
          const uploadPromises = images.map((image) => {
            return new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ folder: "products" }, (error, result) => {
                  if (error) reject(error);
                  else resolve(result.url);
                })
                .end(image.buffer);
            });
          });

          imageUrls = await Promise.all(uploadPromises);
        }

        const product = await productModel.create({
          name,
          brand,
          category,
          stock: parseInt(stock),
          price: parseFloat(price),
          discount: discount ? parseFloat(discount) : 0,
          description,
          images: imageUrls,
          slug,
          sellerId,
        });

        // Populate category information
        const populatedProduct = await productModel
          .findById(product._id)
          .populate("category", "name");

        responseReturn(res, 201, {
          product: populatedProduct,
          message: "Product Added Successfully",
        });
      } catch (error) {
        console.error("Upload error:", error);
        responseReturn(res, 500, { error: "Internal Server Error" });
      }
    } catch (err) {
      console.log(err, "err");
      responseReturn(res, 404, { error: "something went wrong" });
    }
  };

  // end method

  get_products = async (req, res) => {
    const { page = 1, searchValue = "", perPage: perPageUI = 10 } = req.query;
    const { id: sellerId } = req;

    try {
      const currentPage = parseInt(page);
      const perPage = parseInt(perPageUI);
      const skipPage = perPage * (currentPage - 1);

      // Build search query
      const searchQuery = {
        sellerId,
        ...(searchValue && {
          $or: [
            { name: { $regex: searchValue, $options: "i" } },
            { brand: { $regex: searchValue, $options: "i" } },
            { description: { $regex: searchValue, $options: "i" } },
          ],
        }),
      };

      // Get products with pagination
      const products = await productModel
        .find(searchQuery)
        .populate("category", "name")
        .skip(skipPage)
        .limit(perPage)
        .sort({ createdAt: -1 });

      // Get total count
      const totalProducts = await productModel
        .find(searchQuery)
        .countDocuments();

      // Calculate total pages
      const totalPages = Math.ceil(totalProducts / perPage);

      responseReturn(res, 200, {
        products,
        pagination: {
          total: totalProducts,
          per_page: perPage,
          current_page: currentPage,
          total_pages: totalPages,
          from: skipPage + 1,
          to: Math.min(skipPage + perPage, totalProducts),
        },
      });
    } catch (error) {
      console.error("Get products error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // end method

  get_product = async (req, res) => {
    try {
      const { id } = req.params;

      const product = await productModel
        .findById(id)
        .populate("category", "name");

      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }

      responseReturn(res, 200, { product });
    } catch (error) {
      console.error("Get product error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // end method

  update_product = async (req, res) => {
    try {
      const { id: sellerId } = req;
      let { name, brand, category, stock, price, discount, description } =
        req.body;
      const images = req.files;
      const { id } = req.params;

      // Check if product exists and belongs to seller
      const existingProduct = await productModel.findOne({
        _id: id,
        sellerId,
      });

      if (!existingProduct) {
        return responseReturn(res, 404, {
          error: "Product not found or unauthorized",
        });
      }

      name = name.trim();
      const slug = name.split(" ").join("-");

      try {
        const updateData = {
          name,
          brand,
          category,
          stock: parseInt(stock),
          price: parseFloat(price),
          discount: discount ? parseFloat(discount) : 0,
          description,
          slug,
        };

        if (images && images.length > 0) {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
          });

          // Upload new images to Cloudinary
          const uploadPromises = images.map((image) => {
            return new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ folder: "products" }, (error, result) => {
                  if (error) reject(error);
                  else resolve(result.url);
                })
                .end(image.buffer);
            });
          });

          const newImageUrls = await Promise.all(uploadPromises);
          updateData.images = [...existingProduct.images, ...newImageUrls];
        }

        const product = await productModel.findByIdAndUpdate(id, updateData, {
          new: true,
        });

        const populatedProduct = await productModel
          .findById(product._id)
          .populate("category", "name");

        responseReturn(res, 200, {
          product: populatedProduct,
          message: "Product Updated successfully",
        });
      } catch (error) {
        console.error("Update error:", error);
        responseReturn(res, 500, { error: "Internal Server Error" });
      }
    } catch (err) {
      console.log(err, "err");
      responseReturn(res, 404, { error: "something went wrong" });
    }
  };

  // end method

  delete_product = async (req, res) => {
    try {
      const { id: sellerId } = req;
      const { id } = req.params;

      // Check if product exists and belongs to seller
      const product = await productModel.findOne({
        _id: id,
        sellerId,
      });

      if (!product) {
        return responseReturn(res, 404, {
          error: "Product not found or unauthorized",
        });
      }

      await productModel.findByIdAndDelete(id);

      responseReturn(res, 200, { message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // end method

  delete_product_image = async (req, res) => {
    try {
      const { id: sellerId } = req;
      const { id, imageUrl } = req.body;

      // Check if product exists and belongs to seller
      const product = await productModel.findOne({
        _id: id,
        sellerId,
      });

      if (!product) {
        return responseReturn(res, 404, {
          error: "Product not found or unauthorized",
        });
      }

      // Remove image from array
      const updatedProduct = await productModel.findByIdAndUpdate(
        id,
        { $pull: { images: imageUrl } },
        { new: true }
      );

      responseReturn(res, 200, {
        product: updatedProduct,
        message: "Image removed successfully",
      });
    } catch (error) {
      console.error("Delete image error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // end method
}

module.exports = new productController();
