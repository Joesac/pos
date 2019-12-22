require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Product = require("./models/product");
const Checkout = require("./models/checkout");
const Discount = require("./models/discount")
const User = require("./models/user")

mongoose.set('useFindAndModify', false)

mongoose.connect(`${process.env.CONNECTION}/${process.env.DATABASE}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
const connection = mongoose.connection;
connection.on("error", err => console.error(err));
connection.once("open", () => console.log("Database Connected"));

app.use(express.json());

async function getProduct(req, res, next) {
  let foundProduct;
  let product;
  
  try {
    product = await Product.findById(req.params.id);
    if (product === null) {
      return res.status(404).json({ message: "Cannot find product" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.foundProduct = product;
  next();
}

async function getUser(req, res, next) {
  let foundUser;
  let user;
  
  try {
    user = await User.findById(req.params.id);
    if (user === null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.foundUser = user;
  next();
}

async function getCheckout(req, res, next) {
  let foundCheckout;
  let checkout;
  try {
    checkout = await Checkout.findById(req.params.id);
    if (checkout === null) {
      return res.status(404).json({ message: "Cannot find checkout" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.foundCheckout = checkout;
  next();
}

// INSERT
// Insert Product
app.post("/product", async (req, res) => {
  const { name, price, qty, reorderLevel } = req.body;
  const product = new Product({ name: name, price: price, qty: qty, reorderLevel: reorderLevel });
  
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Insert Checkout
app.post("/checkout", async (req, res) => {
  const { products } = req.body
  // Check to see if each of the quantity of products available are more than or equal
  // to the quantity of each product selected
  for (let i = 0; i < products.length; i++) {
    productName = products[i].name
    productQty = products[i].qty
    const productWIthLowQty = await Product.find({name: { $eq: productName }, qty: { $lt: productQty } } )
    if (productWIthLowQty.length) {
      res.json({ lowerPdt: productWIthLowQty })
      return
    }
  }

  // if each of the products passed quantity comparison check then subtract quantity
  try {
    let lastProductSubtracted
    for (let i = 0; i < products.length; i++) {
      productName = products[i].name
      productQty = products[i].qty
      lastProductSubtracted = await Product.findOneAndUpdate({"name": { $regex: `^${productName}`, $options: 'ig' } }, { $inc: { "qty": -productQty } } )
    }
    // res.status(200).json(lastProductSubtracted)
  } catch (err) {
    res.status(500).json({ message: err.message })
    return
  }

//   res.send(req.body)
// return
  try {
    let numOfCheckouts = await Checkout.estimatedDocumentCount()
    req.body.receiptNumber = numOfCheckouts + 1
    const checkout = new Checkout({ sale: req.body })
    const newCheckout = await checkout.save()
    res.status(201).json(newCheckout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Insert User
app.post("/user", async (req, res) => {
  const { fullname, username, password, role } = req.body
  try {
    const user = new User({ fullname: fullname, username: username, password: password, role: role });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body
  try {
    const loggedInUser = await User.findOne({username: { $regex: `^${username}`, $options: 'ig' }, password: password})
    res.json(loggedInUser)
  } catch(err) {
    res.status(400).json({ message: err.message })
  }
})

app.post("/report/search", async (req, res) => {
  const { dt, df } = req.body
  const dateTo = new Date(dt)
  const dateFrom = new Date(df)

  try {
    const checkouts = await Checkout.find({
      dateAdded: { $gte: dateFrom, $lte: dateTo }
    })
    res.json(checkouts)
  } catch(err) {
    res.status(400).json({ message: err.message })
  }
})

// creating discount / Saving discount
app.post("/discount", async (req, res) => {
  const { discount, conditionalDiscountAmount } = req.body
  res.json(req.body)
  return
  try {
    // if (id != undefined) {
    //   discountCount = await Discount.update({id: ObjectId(_id)})
    // } else {
    //   await Discount.update
    // }
    res.json(discount)
  } catch(err) {
    res.status(400).json({ message: err.message })
  }
})

// READ
// Get receipt numbers
app.get("/receipt-numbers/:date", async (req, res) => {
  const { date } = req.params
  const parsedDate = new Date(date)
  
  try {
    const checkouts = await Checkout.find({
      dateAdded: { $eq: parsedDate }
    })
    res.json(checkouts)
  } catch(err) {
    res.status(400).json({ message: err.message })
  }
}) 

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search for product
app.get("/search/products/", async (req, res) => {
  searchTerm = req.query.searchTerm;

  try {
    const searchedRes = await Product.find({
      name: { $regex: `^${searchTerm}`, $options: "ig" }
    });
    res.json(searchedRes);
  } catch (err) {
    res.status(500).json({ message: "Error in retrieving Searched Data" });
  }
});

// Search for user
app.get("/search/users", async (req, res) => {
  searchTerm = req.query.searchTerm;

  try {
    const searchedRes = await User.find({
      fullname: { $regex: `${searchTerm}`, $options: "ig" }
    });
    res.json(searchedRes);
  } catch (err) {
    res.status(500).json({ message: "Error in retrieving Searched Data" });
  }
})

// Get a Product
app.get("/products/:id", getProduct, (req, res) => {
  res.send(res.foundProduct);
});

// Get a checkout
app.get("/checkouts/:id", getCheckout, (req, res) => {
  res.send(res.foundCheckout);
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
app.post("/products/edit/:id", getProduct, async (req, res) => {
  
  if (req.body.name !== null) {
    res.foundProduct.name = req.body.name;
  }
  if (req.body.price !== null) {
    res.foundProduct.price = req.body.price;
  }
  if (req.body.qty !== null) {
    res.foundProduct.qty = req.body.qty;
  }
  if (req.body.reorderLevel !== null) {
    res.foundProduct.reorderLevel = req.body.reorderLevel;
  }
  
  try {
    updatedProduct = await res.foundProduct.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/users/edit/:id", getUser, async (req, res) => {
  
  if (req.body.fullname !== null) {
    res.foundUser.fullname = req.body.fullname;
  }
  if (req.body.username !== null) {
    res.foundUser.username = req.body.username;
  }
  if (req.body.password !== null) {
    res.foundUser.password = req.body.password;
  }
  if (req.body.role !== null) {
    res.foundUser.role = req.body.role
  }
  
  try {
    updatedUser = await res.foundUser.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
// Delete a product
app.delete("/products/:id", getProduct, async (req, res) => {
  try {
    await res.foundProduct.remove();
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen("3000", () => console.log("Server started on port 3000..."));
