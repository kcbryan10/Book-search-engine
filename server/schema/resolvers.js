const { AuthenticationError } = require('apollo-server-errors');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id}).select(
                    "-_v -password"
                );
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('invalid credentials!');
            }

            const validPassword = await user.isCorrectPassword(password);
            
            if(!validPassword) {
                throw new AuthenticationError('invalid credentials!');
            }
            
            const token = signToken(user);

            return {token, user};
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        savedBook: async (parent, { input }, context) => {
            if (context.user) {
                const updateUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: {savedBook: { bookId: bookId }}},
                    { new: true}
                );
                return updateUser;
            }
            throw new AuthenticationError('invalid credentials!');        
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updateUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: {savedBook: { bookId: bookId }}},
                    { new: true}
                );
                return updateUser;
            }
            throw new AuthenticationError('invalid credentials!');
        },
    }
}

module.exports = resolvers;