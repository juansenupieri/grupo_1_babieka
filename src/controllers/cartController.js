//----------* REQUIRE'S *----------//
const db = require('../db/models');


//----------* MAIN CONTROLLER *----------//
const cartController = {
    // Renderiza la vista Carrito
    cart: async (req, res) => {     
        // Busca los productos correspondientes al usuario en sesión 
        const cartItems =  await db.Item.findAll({where:{
            user_id: req.session.user.id,
            status: 0
        }})

		res.render('products/productCart', { cartItems }); 
    },
    
    // Agrega un Producto al Carrito
    addItem:  async (req, res) => {
        // Buscar el articulo a cargar en el carrito por su "id" y guardarlo
        const productToAdd = await db.Product.findByPk(req.params.id, {
            include: { 
                all: true, 
                nested: true
            }
        });
       
        let quantity = req.body.productsQuantity;
       
        // Crear un nuevo item con el "id" del usuario en session y los datos del producto a cargar
        // Completar los campos "status" = 0 y "order_id" = null
        console.log("talle que entra = "+req.body.size)
        console.log("el color que entra es = "+req.body.color)

        await db.Item.create({
            name: productToAdd.model.name,
            description: productToAdd.model.description,
            image: productToAdd.model.image.name,
            price: productToAdd.price,
            quantity: quantity,
            subtotal: productToAdd.discount.number > 0 ? (productToAdd.price-((productToAdd.price*productToAdd.discount.number)/100)) * quantity : productToAdd.price * quantity,
            status: 0,
            user_id: req.session.user.id,
            order_id: null
        });

        // Redirecciona Carrito
        return res.redirect('/carrito');
    },

    // Elimina un Producto del Carrito
    removeItem: async (req, res) => {
        await db.Item.destroy({
            where: {
                id: req.params.id
            }
        });

        return res.redirect('/carrito');
    },

    // Procesa la Compra del Producto
    buyItem: async (req,res) => {
        const itemsToBuy =  await db.Item.findAll({
            where:{
                user_id: req.session.user.id,
                status: 0
            }
        });

        let totalPrice = 0;

        itemsToBuy.forEach(element => {
            totalPrice = totalPrice + element.subtotal
        });

        let newOrder = await db.Order.create({
            user_id: req.session.user.id,
            total: totalPrice
        });

        let orderId = newOrder.id;

        await db.Item.update({
            status: 1,
            order_id: orderId
        },
        {where: {
            status: 0,
            user_id: req.session.user.id
            }
        });

        return res.redirect('/carrito/compra-finalizada');
    },

    // Renderiza la vista Compra Finalizada
    purchaseCompleted: (req,res) => {
        return res.render('products/purchaseCompleted');
    },

    // Renderiza la vista Mis Compras
    myPurchases: async (req,res) => {
        purchasedItems = await db.Item.findAll({
            where: {
                status: 1,
                user_id: req.session.user.id
            }
        });

        return res.render('products/myPurchases', { purchasedItems });
    }
};


//----------* EXPORTS CONTROLLER *----------//
module.exports = cartController;