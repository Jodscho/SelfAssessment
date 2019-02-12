const Ajv = require('ajv');
const mongoose = require('mongoose');

// load local dependencies
const logger = require('../utils/logger');

const CourseSchema = new mongoose.Schema({
    name: String,
    icon: String,
    configs: [{
        language: String,
        config: Object
    }]
});

/**
 * Schema for a single test.
 * A test definition contains the following elements:
 *
 * ================
 * === REQUIRED ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   id           Integer: unique identifier (unique within a JSON document)
 * ------------------------------------------------------------------------------------------------
 *   type         String: type of the test (i.e. logic, concentration, ...)
 *                As of now, this attribute is not taken into consideration by the backend and is
 *                relevant only to the frontend.
 * ------------------------------------------------------------------------------------------------
 *   category     String: category of the test
 *                Used by the frontend to build the test interface and by the backend to calculate
 *                test scores and overall results. Thus, it must be one of the predefined values
 *                [checkbox, multiple-options, radio-buttons, speed].
 * ------------------------------------------------------------------------------------------------
 *   description  String: describes the test to the user before reading the task
 *                Providides illustrations or help text preparing the user for the upcoming task.
 * ------------------------------------------------------------------------------------------------
 *   task         String: task that is to be completed by the user
 * ------------------------------------------------------------------------------------------------
 *   options      Array: possible options for this task
 *                A correct option will increase the test
 *                score by one, a wrong one will not affect the score.
 * ------------------------------------------------------------------------------------------------
 *   evaluated    Boolean: whether the backend should evaluate this test
 *                If false, no scores will be calculated for this test.
 * ------------------------------------------------------------------------------------------------
 *
 * ================
 * === OPTIONAL ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   header       Array: list of option labels
 *                Only for multiple-options tests.
 *                For example, the header for a test with three options per task might look like
 *                the following:
 *                "header": [
 *                  "< 10",
 *                  "10",
 *                  "> 10"
 *                ]
 * ------------------------------------------------------------------------------------------------
 */
const SINGLE_TEST_SCHEMA = {
    "$id": "/SingleTest",
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "type": {"type": "string"},
        "category": {
            "type": "string",
            "enum": ["checkbox", "multiple-options", "radio-buttons", "speed"]
        },
        "description": {"type": "string"},
        "task": {"type": "string"},
        "seconds": {"type": "integer"},
        "options": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "correct": {}
                }
            }
        },
        "header": {
            "type": "array",
            "items": {"type": "string"}
        },
        "evaluated": {"type": "boolean"},
    },
    "required": ["id", "type", "description", "task", "options", "evaluated"]
};

/**
 * Schema for a test group.
 * A test group contains the following elements:
 *
 * ================
 * === REQUIRED ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   id           Integer: unique identifier (unique within a JSON document)
 * ------------------------------------------------------------------------------------------------
 *   tests        Array: single test ids
 * ------------------------------------------------------------------------------------------------
 *
 * ================
 * === OPTIONAL ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   select       Integer: make the frontend randomly pick a number of tests from the tests array
 *                Allows for randomization of tests, so users have to possibly work on different
 *                tasks.
 * ------------------------------------------------------------------------------------------------
 */
const TEST_GROUP_SCHEMA = {
    "$id": "/TestGroup",
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "tests": {
            "type": "array",
            "items": {"type": "integer"}
        },
        "select": {"type": "integer"},
    },
    "required": ["id", "tests"]
};

/**
 * Schema for a test set.
 * A test set contains the following elements:
 *
 * ================
 * === REQUIRED ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   id           Integer: unique identifier (unique within a JSON document)
 * ------------------------------------------------------------------------------------------------
 *   elements     Array: single test ids
 * ------------------------------------------------------------------------------------------------
 */
const TEST_SET_SCHEMA = {
    "$id": "/TestSet",
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "elements": {
            "type": "array",
            "items": {"type": "integer"}
        }
    },
    "required": ["id", "elements"]
};

/**
 * Schema for an info page.
 * An info page contains the following elements:
 *
 * ================
 * === REQUIRED ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   id           Integer: unique identifier (unique within a JSON document)
 * ------------------------------------------------------------------------------------------------
 *   text         String: information needed for the user to understand a task
 *                Infopages are generally shown before the actual test (or any of its attributes,
 *                such as task, description, etc.) is displayed.
 * ------------------------------------------------------------------------------------------------
 *   belongs      Integer: unique identifier (unique within a JSON document)
 *                Infopages can be assigned to single tests, test groups or test sets.
 *                This affects the place where the frontend renders the page.
 * ------------------------------------------------------------------------------------------------
 *
 * ================
 * === OPTIONAL ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   select       Integer: make the frontend randomly pick a number of tests from the tests array
 *                Allows for randomization of tests, so users have to possibly work on different
 *                tasks.
 * ------------------------------------------------------------------------------------------------
 */
const INFO_PAGE_SCHEMA = {
    "$id": "/InfoPage",
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "text": {"type": "string"},
        "belongs": {
            "type": "array",
            "items": {"type": "integer"}
        }
    },
    "required": ["id"]
};

/**
 * Schema for a complete test definition.
 * An test contains the following elements:
 *
 * ================
 * === REQUIRED ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   title        String: title of the test, e.g. "Computer Science"
 *                The frontend uses this string to label a test in the course overview.
 * ------------------------------------------------------------------------------------------------
 *   icon         String: absolute path (URI) to an image
 *                Again used by the frontend to present the course entity.
 * ------------------------------------------------------------------------------------------------
 *   tests        Array: list of SINGLE_TEST_SCHEMA instances
 * ------------------------------------------------------------------------------------------------
 *
 * ================
 * === OPTIONAL ===
 * ================
 *
 * ------------------------------------------------------------------------------------------------
 *   testsgroups  Array: list of TEST_GROUP_SCHEMA instances
 * ------------------------------------------------------------------------------------------------
 *   sets         Array: list of TEST_SET_SCHEMA instances
 * ------------------------------------------------------------------------------------------------
 *   infopages    Array: list of INFO_PAGE_SCHEMA instances
 * ------------------------------------------------------------------------------------------------
 */
const TEST_SCHEMA = {
    "$id": "/Test",
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "icon": {"type": "string"},
        "validationSchema": {"type": "string"},
        "tests": {
            "type": "array",
            "items": {"$ref": "/SingleTest"}
        },
        "testgroups": {
            "type": "array",
            "items": {"$ref": "/TestGroup"}
        },
        "sets": {
            "type": "array",
            "items": {"$ref": "/TestSet"}
        },
        "infopages": {
            "type": "array",
            "items": {"$ref": "/InfoPage"}
        },
    },
    "required": ["title", "validationSchema", "tests"]
};

/**
 * Validate a given JSON object against our internal config format scheme.
 * Returns true for valid configs, false otherwise.
 *
 * @param {JSON} config The config object as JSON
 */
CourseSchema.statics.validateConfig = function(config) {
    // 1. validate config against the pre-defined schemas
    const ajv = new Ajv();
    const validate = ajv.addSchema(SINGLE_TEST_SCHEMA).addSchema(TEST_GROUP_SCHEMA)
        .addSchema(TEST_SET_SCHEMA).addSchema(INFO_PAGE_SCHEMA).compile(TEST_SCHEMA);
    if (!validate(config)) {
        logger.warn(JSON.stringify(validate.errors));
        return false;
    }

    // 2. check for valid single test attributes
    const tests = config['tests'];
    let testIDs = [];
    for (const test of tests) {
        // check whether the test ID is unique
        if (testIDs.indexOf(test['id']) > -1) {
            logger.warn('CourseModel: validateConfig: "id" not unique: ' + test['id']);
            return false;
        }

        // special case: multiple-options test
        // here, each "option" MUST have a "correct" attribute, specifying the index of the correct
        // option in the header
        if (test['category'] === 'multiple-options') {
            for (const option of test['options']) {
                if (!('correct' in option)) {
                    // abort, this is not a valid test definition
                    logger.warn('CourseModel: validateConfig: multiple-options test: ' + 
                                test['id'] + ' requires the "correct" attribute for each option!');
                    return false;
                }
            }
        }

        // special case: speed test
        // here, each "option" MUST have a "correct" attribute, specifying the expected substring
        // to match against
        if (test['category'] === 'speed') {
            for (const option of test['options']) {
                if (!('correct' in option)) {
                    // abort, this is not a valid test definition
                    logger.warn('CourseModel: validateConfig: speed test: ' + test['id'] +
                                ' requires the "correct" attribute for each option!');
                    return false;
                }
            }
        }

        // keep track of all single test IDs
        testIDs.push(test['id']);
    }

    // 3. check for valid testgroup definitions, if any
    const testgroups = config['testgroups'];
    let testgroupIDs = [];
    if (testgroups) {
        for (const group of testgroups) {
            // check whether the testgroup ID is unique
            if (testgroupIDs.indexOf(group['id']) > -1) {
                logger.warn('CourseModel: validateConfig: "id" not unique: ' + group['id']);
                return false;
            }

            // keep track of all testgroup IDs
            testgroupIDs.push(group['id']);

            // check whether the referenced tests exist
            const tests = group['tests'];
            for (const testID of tests) {
                if (testIDs.indexOf(testID) == -1) {
                    logger.warn('CourseModel: validateConfig: testgroup references element ID: ' +
                                testID + ', which is unknown');
                    return false;
                }
            }
        }
    }

    // 4. check for valid set definitions, if any
    const testsets = config['sets'];
    let testsetIDs = [];
    if (testsets) {
        for (const set of testsets) {
            // check whether the testset ID is unique
            if (testsetIDs.indexOf(set['id']) > -1) {
                logger.warn('CourseModel: validateConfig: "id" not unique: ' + set['id']);
                return false;
            }

            // keep track of all testset IDs
            testsetIDs.push(set['id']);

            // check whether the referenced elements exist
            const elems = set['elements'];

            for (const elemID of elems) {
                if (testIDs.indexOf(elemID) == -1 && testgroupIDs.indexOf(elemID) == -1) {
                    logger.warn('CourseModel: validateConfig: test set references element ID: ' +
                                elemID + ', which is unknown');
                    return false;
                }
            }
        }
    }

    // 5. check for valid infopage definitions, if any
    const infopages = config['infopages'];
    let infopageIDs = [];
    if (infopages) {
        for (const page of infopages) {
            // check whether the infopage ID is unique
            if (infopageIDs.indexOf(page['id']) > -1) {
                logger.warn('CourseModel: validateConfig: "id" not unique: ' + page['id']);
                return false;
            }

            // keep track of all infopage IDs
            infopageIDs.push(page['id']);

            // check whether the referenced elements exist
            const elems = page['belongs'];
            if (elems) {
                for (const elemID of elems) {
                    if (testIDs.indexOf(elemID) == -1 && testgroupIDs.indexOf(elemID) == -1 &&
                        testsetIDs.indexOf(elemID) == -1) {
                        logger.warn('CourseModel: validateConfig: infopage references element' +
                                    ' ID: ' + elemID + ', which is unknown');
                        return false;
                    }
                }
            }
        }
    }

    // looks like we're clear
    return true;
}

const CourseModel = mongoose.model('Course', CourseSchema);

module.exports = CourseModel;
