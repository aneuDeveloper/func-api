

const deserialize = function (message: string): Map<string, string> {
    let functionEvent = new Map<string, string>(
        [
            ["data", ""],
        ]
    )
    let currentKey = ""
    let currentValue = ""
    let iteratingKey = true
    for (let index = 0; index < message.length; index++) {
        if (message[index] == ",") {
            if (currentKey != "") {
                functionEvent.set(currentKey, currentValue);
            }
            currentKey = ""
            currentValue = ""
            iteratingKey = true
        } else if (message[index] == "=") {
            iteratingKey = false
            currentValue = ""
        } else if (message[index] == "$" && message.length >= index + 4 && message[index + 1] == "e" && message[index + 2] == "%") {
            // catch error and make it failsave
            // get data and break
            // end token $e%,
            if (currentKey != "") {
                functionEvent.set(currentKey, currentValue);
            }
            functionEvent.set("data", message.substring(index + 4, message.length));
            return functionEvent;
        } else {
            if (iteratingKey) {
                currentKey += message[index]
            } else {
                currentValue += message[index]
            }
        }
    };
    if (currentKey != "") {
        functionEvent.set(currentKey, currentValue);
    }
    return functionEvent
}

export default deserialize