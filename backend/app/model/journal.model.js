const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
    associatedPin: Number,
    lastChanged: Date,
    log: {
        _id: false, // stop generating id for nested document object
        sets: [{
            _id: false, // stop generating id for nested document object
            maps: [{
                _id: false, // stop generating id for nested document object
                key: Object, // TODO: allow only a specific type once the spec is final
                val: Array
            }]
        }]
    },
    structure: {
        _id: false, // stop generating id for nested document object
        course: String,
        sets: [{
            _id: false, // stop generating id for nested document object
            set: Object,
            tests: Array
        }]
    }
});

const JournalModel = mongoose.model('Journal', JournalSchema);

module.exports = JournalModel;
