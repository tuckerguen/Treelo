module.exports = (model, id) => {
    return new Promise((resolve, reject) => {
        model.findOne({_id: id}, (err, result) => {
            if(result){
                return resolve(true);
            }
            else{
                return reject(new Error('Foreign key constraint `objectExists` for `${id.toString()}` failed'));
            }
        })
    });
}