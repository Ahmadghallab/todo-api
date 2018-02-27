const bcrypt = require('bcrypt');
const underscore = require('underscore');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
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
  // class level method
  User.authenticate = (body) => {
    return new Promise((resolve, reject) => {
      if(typeof body.email !== 'string' || typeof body.password !== 'string') {
        return reject();
      }
      User.findOne({
        where: {
          email: body.email
        }
      }).then((user) => {
        if(user) {
          if(bcrypt.compareSync(body.password, user.password_hash)) {
            resolve(user);
          } else {
            return reject();
          }
        } else {
          return reject();
        }
      }, (e) => {
        reject();
      });
    });
  };

  // Instance level method
  User.prototype.toPublicJSON = function () {
    let json = this.toJSON();
    return underscore.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
  };

  return User;

}
