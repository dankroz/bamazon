var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to view?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function (user) {
        switch (user.choice) {
            case "View Products for Sale":
                view();
                break;
            case "View Low Inventory":
                viewLow();
                break;
            case "Add to Inventory":
                addInv();
                break;
            case "Add New Product":
                addProduct();
                break
        };
    });
};

function view() {
    connection.query("select item_id, product_name, price, stock_quantity from products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Product ID: " + res[i].item_id + "  ||  Product: " + res[i].product_name + "  ||  Price: $" + res[i].price + "  ||  Stock: " + res[i].stock_quantity);
        }
    });
    connection.end()
    
};

function viewLow() {
    connection.query("select item_id, product_name, stock_quantity from products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 20)
                console.log("Product ID: " + res[i].item_id + "  ||  Product: " + res[i].product_name + "  ||  Stock: " + res[i].stock_quantity);
        }
    })
    connection.end()
};

function addInv() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Product ID of item to add inventory: "
        },
        {
            type: "input",
            name: "quantity",
            message: "How many units are you adding?"
        }
    ]).then(function (user) {
        connection.query("select item_id, stock_quantity from products", function (err, res) {
            for (var i = 0; i < res.length; i++) {
                var item = parseInt(user.id)
                if (res[i].item_id === item) {
                    var stock = res[i].stock_quantity + parseInt(user.quantity);
                    connection.query("UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: stock
                            },
                            {
                                item_id: item
                            }
                        ],
                        function (err) {
                            if (err) throw err;
                            console.log("Inventory added!");
                            console.log("Units now in stock:  " + stock);
                            connection.end();
                        }
                    )
                }
            }
        })
    })
}

function addProduct() {
    inquirer.prompt([
        {
            type: "input",
            name: "product",
            message: "What is the name of the product you are listing? "
        },
        {
            type: "input",
            name: "quantity",
            message: "How many units are you adding?"
        },
        {
            type: "input",
            name: "cost",
            message: "What is the price of the product?"
        },
        {
            type: "input",
            name: "department",
            message: "What department will this be under?"
        }
    ]).then(function (user) {
        connection.query("INSERT INTO products SET ?",
            {
                product_name: user.product,
                department_name: user.department,
                price: user.cost,
                stock_quantity: user.quantity
            },
            function (err) {
                if (err) throw err;
                console.log("Product added!");
                connection.end();
            });
    });
};
