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
    connection.query("select item_id, product_name, price from products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Product ID: " + res[i].item_id + "  || Product: " + res[i].product_name + "  ||  Price: $" + res[i].price)
        }
    })   
};

setTimeout(order, 100);

function order() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "What is the Product ID that you're interested in?"
        },
        {
            type: "input",
            name: "quantity",
            message: "How many of this item would you like to order?"
        }
    ]).then(function (user) {
        connection.query("select item_id, price, stock_quantity, product_sales from products", function (err, res) {
            for (var i = 0; i < res.length; i++) {
                var item = parseInt(user.id)
                if (res[i].item_id === item) {
                    var cost  = res[i].price * user.quantity;
                    if (user.quantity > res[i].stock_quantity) {
                        console.log("Insufficient Stock!")
                        connection.end()
                    }
                    else {
                        var stock = res[i].stock_quantity - user.quantity;
                        var sales = res[i].product_sales + cost;
                        connection.query("UPDATE products SET ? WHERE ?", 
                            [
                                {
                                    stock_quantity: stock,
                                    product_sales: sales
                                },
                                {
                                    item_id: item
                                }
                            ], 
                            function (err) {
                                if (err) throw err;
                                console.log("order placed!");
                                console.log("Your total order costs: $" + cost)
                                connection.end();
                            })
                    }
                }
            }
        })

    })
}

