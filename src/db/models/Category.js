module.exports = (sequelize, DataTypes) => {
    const alias = "Category",
    const cols  = {
        name: {
            type: DataTypes.STRING
        }
    },

    const config = {
        tableName:"categories"
    }
    
    const categoryModel = sequelize.define(alias, cols, config)
    return categoryModel;
}