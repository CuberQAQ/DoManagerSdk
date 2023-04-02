import request from "request"
import jsonfile from "jsonfile"
import jQuery from "jquery";
import jsdom from "jsdom"
const { JSDOM } = jsdom;
const { document } = (new JSDOM('<!doctype html><html><body></body></html>')).window;
global.document = document;
const window = document.defaultView;
const $ = jQuery(window);
let config = jsonfile.readFileSync("./dmng_config.json", {
    encoding: "utf8",
    flag: "r",
})

class DoManagerMemberMonitor {
    jsonObj = null
    async pull() {
        this.jsonObj = await $.getJSON(config.url + "/member")
    }
    async push() {
        request.post(config.url + "/member", {
            json: this.jsonObj
        })
    }
    getMember(nameOrId) {
        if (!this.jsonObj) return null
        if (typeof (nameOrId) == "string") {
            for (let i = 0; i < this.jsonObj.members.length; i++) {
                const member = this.jsonObj.members[i];
                if (member.name == nameOrId) return member
            }
        }
        else if (typeof (nameOrId) == "number") {
            for (let i = 0; i < this.jsonObj.members.length; i++) {
                const member = this.jsonObj.members[i];
                if (member.id == nameOrId) return member
            }
        }
        return null
    }
}

export default class DoManagerSdk {
    static createMonitor(monitorType) {
        switch (monitorType) {
            case DoManagerSdk.monitorType.MEMBER:
                return new DoManagerMemberMonitor
            default:
                return null
        }
    }
}
DoManagerSdk.monitorType = {
    MEMBER: 1
}