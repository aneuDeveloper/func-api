import 'jest';
import deserialize from '../kafka/deserializer'

describe('deserializer tests', () => {

    it('should deserialize event', async () => {
        const functionEvent1 = deserialize('id=kajsdf-349834-asdf-aq3f$e%,{"test":"1"}');
        expect(functionEvent1.get("id")).toBe("kajsdf-349834-asdf-aq3f");
        expect(functionEvent1.get("data")).toBe('{"test":"1"}');

        const functionEvent2 = deserialize('id=kajsdf,v=1,$e%,{"test":"1"}');
        expect(functionEvent2.get("v")).toBe('1');
    });

    it('should not fail with empty data', async () => {
        const functionEvent1 = deserialize('id=kajsdf$e%,');
        expect(functionEvent1.get("data")).toBe("");

        const functionEvent2 = deserialize('id=kajsdf');
        expect(functionEvent2.get("data")).toBe("");
        expect(functionEvent2.get("id")).toBe("kajsdf");
    });



});