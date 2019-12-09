require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Category = require('./models/category')
const Product = require('./models/product')
const Checkout = require('./models/checkout')

mongoose.connect(`${process.env.CONNECTION}/${process.env.DATABASE}`, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true)
const connection = mongoose.connection
connection.on('error', (err) => console.error(err))
connection.once('open', () => console.log('Database Connected'))

app.use(express.json())

async function getCategory(req, res, next) {
    let foundCategory
    let category
    
    try {
        category = await Category.findById(req.params.id)
        if (category === null) {
            return res.status(404).json({message: 'Cannot find category'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    
    res.foundCategory = category
    next()
}

async function getProduct(req, res, next) {
    let foundProduct
    let product
    try {
        product = await Product.findById(req.params.id)
        if (product === null) {
            return res.status(404).json({message: 'Cannot find product'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    
    res.foundProduct = product
    next()
}

async function getCheckout(req, res, next) {
    let foundCheckout
    let checkout
    try {
        checkout = await Checkout.findById(req.params.id)
        if (checkout === null) {
            return res.status(404).json({message: 'Cannot find checkout'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    
    res.foundCheckout = checkout
    next()
}

// INSERT
// Insert Category
app.post('/category', async (req, res) => {
    const { name } = req.body
    const category = new Category({ name: name })
    
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory)
    } catch(err) {
        res.status(400).json({message: err.message})
    } 
})

// Insert Product
app.post('/product', async (req, res) => {
    const { name, category, price } = req.body
    const product = new Product({ name: name, price: price, category: category })
    
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct)
    } catch(err) {
        res.status(400).json({message: err.message})
    } 
})

// Insert Checkout
app.post('/checkout', async (req, res) => {
    const { product, quantity, totalAmount } = req.body
    const checkout = new Checkout({ product: product, quantity: quantity, totalAmount: totalAmount })
    
    try {
        const newCheckout = await checkout.save();
        res.status(201).json(newCheckout)
    } catch(err) {
        res.status(400).json({message: err.message})
    } 
})

// READ
// Get all Categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({})
        res.send(categories)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

// Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({})
        res.send(products)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

app.get('/search/products/', async (req, res) => {
    searchTerm = req.query.searchTerm
    
    try {
        const searchedRes = await Product.find({ name: { $regex: `^${searchTerm}`, $options: 'ig' } })
        res.json(searchedRes)
    } catch(err) {
        res.status(500).json({ "message": "Error in retrieving Searched Data"})
    }
})

// Get a Category
app.get('/categories/:id', getCategory, (req, res) => {
    res.send(res.foundCategory)
})

// Get a Product
app.get('/products/:id', getProduct, (req, res) => {
    res.send(res.foundProduct)
})

// Get a Product
app.get('/checkouts/:id', getCheckout, (req, res) => {
    res.send(res.foundCheckout)
})

// UPDATE
// Update a specific Category
app.patch('/categories/:id', getCategory, async (req, res) => {
    if (req.body.name !== null) {
        res.foundCategory.name = req.body.name
    }

    try {
        updatedCategory = await res.foundCategory.save()
        res.json(updatedCategory)
    } catch(err) {
        res.status(400).json({ message: err.message })
    }
})

app.patch('/products/:id', getProduct, async (req, res) => {
    
    if (req.body.name !== null) {
        res.foundProduct.name = req.body.name
    }
    if (req.body.price !== null) {
        res.foundProduct.price = req.body.price
    }
    if (req.body.category !== null) {
        res.foundProduct.category = req.body.category
    }

    try {
        updatedProduct = await res.foundProduct.save()
        res.json(updatedProduct)
    } catch(err) {
        res.status(400).json({ message: err.message })
    }
})

// DELETE
// Delete a Category
app.delete('/categories/:id', getCategory, async (req, res) => {
    try {
        await res.foundCategory.remove()
        res.json({message: 'Category removed' })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

// Delete a product
app.delete('/products/:id', getProduct, async (req, res) => {
    try {
        await res.foundProduct.remove()
        res.json({message: 'Product removed' })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

app.listen('3000', () => console.log('Server started on port 3000...'))