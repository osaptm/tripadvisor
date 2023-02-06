await dbConnection();

    const UserSchema = new Schema({
        name: String,
        posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
    });
    
    const PostSchema = new Schema({
        title: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
    });
    
    const CommentSchema = new Schema({
        text: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' }
    });

    const Post = model("Post", PostSchema);
    const User = model("User", UserSchema);
    const Comment = model("Comment", CommentSchema);

    // const newUser = new User({name:"Mario"}); 
    // await newUser.save();
    // const newUser2 = new User({name:"Aler"}); 
    // await newUser2.save();

    // for  (let index = 0; index < 5; index++) {
    //     const newPost = new Post({title:"POST "+index , author: ObjectId('63dff2ddc5a217110b59a73e')});
    //     await User.updateOne({ _id: ObjectId('63dff2ddc5a217110b59a73e') }, { $push: { posts: newPost._id } });
    //     await newPost.save();        
    // }

    // for  (let index2 = 0; index2 < 5; index2++) {
    //     const newComment = new Comment({text:"Comment "+index2 , author: ObjectId('63dfe05d68b232102450dc37')});
    //     await Post.updateOne({ _id: ObjectId('63dfe05d68b232102450dc37') }, { posts : posts.push(ObjectId('63dfe05d68b232102450dc37')) });
    //     await newComment.save();        
    // }



    // Post.findOne({ title: "POST 0" })
    // .populate("author")
    // .exec((err, post) => {
    //     // Will have post.author populated
    //     if (!err) console.log(post);
    //     else console.log(err)
    // });


    //await Post.deleteOne({_id: ObjectId('63dfe9457416f78488ce2b8b')});

    User.findByIdAndDelete("63dff2ddc5a217110b59a73e")
    .populate("posts")
    .exec((err, user) => {
        // Will have post.author populated
        if (!err) console.log(user);
        process.exit(0);
    });


    // User.findById("63dff2ddc5a217110b59a73e")
    // .populate("posts")
    // .exec((err, user) => {
    //     // Will have post.author populated
    //     if (!err) console.log(user);
    //     process.exit(0);
    // });



    // User.findById("63dfe05d68b232102450dc37")
    // .populate({
    //     path: "posts", match: {
    //         title: /^T/i
    //     }, select: "title"
    // })
    // .exec((err, user) => {
    //     // Will have post.author populated
    //     if (!err) console.log(user);
    //     process.exit(0);
    // });


    // User.findById("63dfe05d68b232102450dc37")
    // .populate({
    //     path: "posts", options: {
    //         sort: { title: 1 }, limit: 2
    //     }
    // })
    // .exec((err, user) => {
    //     // Will have post.author populated
    //     if (!err) console.log(user);
    //     process.exit(0);
    // });


    // User.findById("63dfe05d68b232102450dc37")
    // .populate({ path: "posts", select: "title -_id" }) // Inclue title, exclude _id
    // .exec((err, user) => {
    //     if (!err) console.log(user);
    //     process.exit(0);
    // });


    // User.findOne({ name: 'John' }).populate({
    //     path: 'posts',
    //     populate: {
    //         path: 'comments',
    //         model: 'Comment',
    //         populate: {
    //             path: 'author',
    //             model: 'User'
    //         }
    //     }
    // }).exec((err, user) => {
    //     console.log(user);
    // });
