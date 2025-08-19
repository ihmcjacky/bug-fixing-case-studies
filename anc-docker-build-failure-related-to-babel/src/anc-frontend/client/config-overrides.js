const {override, addWebpackModuleRule} = require("customize-cra");
const path = require("path");

module.exports = override(
    addWebpackModuleRule({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
    }),
    // Add Babel loader for specific node_modules that use modern JS syntax
    addWebpackModuleRule({
        test: /\.(js|jsx)$/,
        include: [
            path.resolve(__dirname, "node_modules/react-draggable")
        ],
        use: {
            loader: "babel-loader",
            options: {
                presets: [
                    ["@babel/preset-env", {
                        targets: {
                            browsers: [">0.2%", "not dead", "not op_mini all"]
                        }
                    }]
                ],
                plugins: [
                    "@babel/plugin-proposal-optional-chaining",
                    "@babel/plugin-proposal-nullish-coalescing-operator"
                ]
            }
        }
    })
)
