import { onCall } from "firebase-functions/v2/https";

// export const shopifyProducts = onCall(async (data) => {
//     try {
//         const shopifyApiKey = "eee58d1b00b3eef5c9073b72d3a8dba7";
//         const shopifyPassword = "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";
//         const shopifyShopName = "0f7134-3.myshopify.com";
//         const apiVersion = "2023-10";


//         const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;

//         const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products.json`;

//         const axiosResponse = await axios.get(url, {
//             headers: {
//                 Authorization: authHeader,
//             },
//         });

//         const jsonData = axiosResponse.data();
//         return jsonData;
//     } catch (error) {
//         return error;
//     }
// });

export const shopifyProducts = onCall(async (data) => {
    try {
        const shopifyApiKey = "eee58d1b00b3eef5c9073b72d3a8dba7";
        const shopifyPassword = "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";
        const shopifyShopName = "0f7134-3.myshopify.com";
        const apiVersion = "2023-10";


        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;

        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products.json`;
        var fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            var prods = await result.json();
            for (var i = 0; i < prods["products"].length; i++) {
                var id = prods["products"][i].id;
                fData.push({
                    "id": id,
                    "component": getProductComponent(id)
                });
            }
        });

        return fData;
    } catch (error) {
        return error;
    }
});

const getProductComponent = (id: any) => {

    return `
<div class="w-embed w-script">
<div id='product-component-${id}' class="shopify-buy-frame shopify-buy-frame--product shopify-buy__layout-vertical" style="max-width: 280px;">
<iframe horizontalscrolling="no" verticalscrolling="no" allowtransparency="true" frameborder="0" scrolling="no" name="frame-product-${id}" style="width: 100%; overflow: hidden; border: none; height: 265px;">
</iframe>
</div>
<script type="text/javascript">
(function () {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    if (window.ShopifyBuy) {
        if (window.ShopifyBuy.UI) {
            ShopifyBuyInit();
        } else {
            loadScript();
        }
    } else {
        loadScript();
    }
    function loadScript() {
        var script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
        script.onload = ShopifyBuyInit;
    }
    function ShopifyBuyInit() {
        var client = ShopifyBuy.buildClient({
            domain: '0f7134-3.myshopify.com',
            storefrontAccessToken: '5f62c1f47bff4a49a60e15b2b6e4f3c2',
        });
        ShopifyBuy.UI.onReady(client).then(function (ui) {
            ui.createComponent('product', {
                id: '${id}',
                node: document.getElementById('product-component-${id}'),
                moneyFormat: 'Rs.%20%7B%7Bamount%7D%7D',
                options: {
                    "product": {
                        "styles": {
                            "product": {
                                "@media (min-width: 601px)": {
                                    "max-width": "calc(25% - 20px)",
                                    "margin-left": "20px",
                                    "margin-bottom": "50px"
                                }
                            },
                            "button": {
                                "font-family": "Open Sans, sans-serif",
                                ":hover": {
                                    "background-color": "#549479"
                                },
                                "background-color": "#5da486",
                                ":focus": {
                                    "background-color": "#549479"
                                }
                            }
                        },
                        "buttonDestination": "checkout",
                        "text": {
                            "button": "Buy now"
                        },
                        "googleFonts": [
                            "Open Sans"
                        ]
                    },
                    "productSet": {
                        "styles": {
                            "products": {
                                "@media (min-width: 601px)": {
                                    "margin-left": "-20px"
                                }
                            }
                        }
                    },
                    "modalProduct": {
                        "contents": {
                            "img": false,
                            "imgWithCarousel": true,
                            "button": false,
                            "buttonWithQuantity": true
                        },
                        "styles": {
                            "product": {
                                "@media (min-width: 601px)": {
                                    "max-width": "100%",
                                    "max-height": "130px",
                                    "margin-left": "0px",
                                    "margin-bottom": "0px"
                                }
                            },
                            "button": {
                                "font-family": "Open Sans, sans-serif",
                                ":hover": {
                                    "background-color": "#549479"
                                },
                                "background-color": "#5da486",
                                ":focus": {
                                    "background-color": "#549479"
                                }
                            }
                        },
                        "googleFonts": [
                            "Open Sans"
                        ],
                        "text": {
                            "button": "Add to cart"
                        }
                    },
                    "option": {},
                    "cart": {
                        "styles": {
                            "button": {
                                "font-family": "Open Sans, sans-serif",
                                ":hover": {
                                    "background-color": "#549479"
                                },
                                "background-color": "#5da486",
                                ":focus": {
                                    "background-color": "#549479"
                                }
                            }
                        },
                        "text": {
                            "total": "Subtotal",
                            "button": "Checkout"
                        },
                        "googleFonts": [
                            "Open Sans"
                        ]
                    },
                    "toggle": {
                        "styles": {
                            "toggle": {
                                "font-family": "Open Sans, sans-serif",
                                "background-color": "#5da486",
                                ":hover": {
                                    "background-color": "#549479"
                                },
                                ":focus": {
                                    "background-color": "#549479"
                                }
                            }
                        },
                        "googleFonts": [
                            "Open Sans"
                        ]
                    }
                },
            });
        });
    }
})();
</script>
</div>
`;
}
