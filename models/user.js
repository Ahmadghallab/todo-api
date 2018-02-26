const bcrypt = require('bcrypt');
const underscore = require('underscore');

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function (value) {
        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  },
  {
    hooks: {
      beforeValidate: (user, options) => {
        if(typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    }
  });
}
