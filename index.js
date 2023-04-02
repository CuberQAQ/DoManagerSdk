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
    async pull(url) {
        return this.jsonObj = await $.getJSON((url ?? config.url) + "/member")
    }
    async push(url, json) {
        request.post((url ?? config.url) + "/member", {
            json: json ?? this.jsonObj
        })
    }
    addScore(target, score, reason, json) {
        if(!isNaN(Number(target))) target = Number(target) 
        let jsonObj = json ?? this.jsonObj
        if (!jsonObj) return null
        let targetMember = null
        if (typeof (target) == "string") {
            for (let i = 0; i < jsonObj.members.length; i++) {
                const member = jsonObj.members[i];
                if (member.name == target) {targetMember = member; break}
            }
        }
        else if (typeof (target) == "number") {
            for (let i = 0; i < jsonObj.members.length; i++) {
                const member = jsonObj.members[i];
                if (member.id == target) {targetMember = member; break}
            }
        }
        if(!targetMember) return null
        let score_num = Number(score)
        if(isNaN(score_num)) return null
        jsonObj.log.push({
            id: targetMember.id,
            operation: "add",
            reason,
            utc: Date.now(),
            score: score_num
        })
        this.jsonObj = jsonObj
        jsonfile.writeFileSync("./dmng_member.json",jsonObj,  {
            encoding: "utf8"
        })
        targetMember.todayPes += score_num
        return targetMember
    }
    removeScore(target, score, reason, json) {
        if(!isNaN(Number(target))) target = Number(target) 
        let jsonObj = json ?? this.jsonObj
        if (!jsonObj) return null
        let targetMember = null
        if (typeof (target) == "string") {
            for (let i = 0; i < jsonObj.members.length; i++) {
                const member = jsonObj.members[i];
                if (member.name == target) {targetMember = member; break}
            }
        }
        else if (typeof (target) == "number") {
            for (let i = 0; i < jsonObj.members.length; i++) {
                const member = jsonObj.members[i];
                if (member.id == target) {targetMember = member; break}
            }
        }
        if(!targetMember) return null
        let score_num = Number(score)
        if(isNaN(score_num)) return null
        jsonObj.log.push({
            id: targetMember.id,
            operation: "remove",
            reason,
            utc: Date.now(),
            score: score_num
        })
        this.jsonObj = jsonObj
        jsonfile.writeFileSync("./dmng_member.json",jsonObj,  {
            encoding: "utf8"
        })
        targetMember.todayPes -= score_num
        return targetMember
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