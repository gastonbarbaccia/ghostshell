'use strict';

(function ($, global) {
    var engagementId,
        livePersonChat = document.getElementById('live-engage-btn'),
        renderedLivePersonChatBtn = document.getElementById('rendered-livengage-chat-btn'),
        isAgentBusy = false,
        chatInitiated = false,
        renderCustomChatBtn = global.lpConfig.renderCustomTextChatButton === 'True' && document.getElementById('rendered-livengage-chat-btn') !== null,
        renderSalesChatButton = (global.lpConfig.renderChatButtonHere === 'True' || renderCustomChatBtn === true),
        livePersonUserInfo = {};

    if (renderCustomChatBtn) {
        renderedLivePersonChatBtn.setAttribute('disabled', 'disabled');
    }

    /* eslint-disable */
    // mTagConfig : Creates connection with LP servers and inits communication.
    global.lpTag=global.lpTag||{},'undefined'==typeof global.lpTag._tagCount?(global.lpTag={wl:lpTag.wl||null,scp:lpTag.scp||null,site:global.lpConfig.siteId||'',section:lpTag.section||'',tagletSection:lpTag.tagletSection||null,autoStart:lpTag.autoStart!==!1,ovr:lpTag.ovr||{},_v:'1.10.0',_tagCount:1,protocol:'https:',events:{bind:function(t,e,i){lpTag.defer(function(){lpTag.events.bind(t,e,i)},0)},trigger:function(t,e,i){lpTag.defer(function(){lpTag.events.trigger(t,e,i)},1)}},defer:function(t,e){0===e?(this._defB=this._defB||[],this._defB.push(t)):1===e?(this._defT=this._defT||[],this._defT.push(t)):(this._defL=this._defL||[],this._defL.push(t))},load:function(t,e,i){var n=this;setTimeout(function(){n._load(t,e,i)},0)},_load:function(t,e,i){var n=t;t||(n=this.protocol+'//'+(this.ovr&&this.ovr.domain?this.ovr.domain:'lptag.liveperson.net')+'/tag/tag.js?site='+this.site);var o=document.createElement('script');o.setAttribute('charset',e?e:'UTF-8'),i&&o.setAttribute('id',i),o.setAttribute('src',n),document.getElementsByTagName('head').item(0).appendChild(o)},init:function(){this._timing=this._timing||{},this._timing.start=(new Date).getTime();var t=this;global.attachEvent?global.attachEvent('onload',function(){t._domReady('domReady')}):(global.addEventListener('DOMContentLoaded',function(){t._domReady('contReady')},!1),global.addEventListener('load',function(){t._domReady('domReady')},!1)),'undefined'===typeof global._lptStop&&this.load()},start:function(){this.autoStart=!0},_domReady:function(t){this.isDom||(this.isDom=!0,this.events.trigger('LPT','DOM_READY',{t:t})),this._timing[t]=(new Date).getTime()},vars:lpTag.vars||[],dbs:lpTag.dbs||[],ctn:lpTag.ctn||[],sdes:lpTag.sdes||[],hooks:lpTag.hooks||[],identities:lpTag.identities||[],ev:lpTag.ev||[]},lpTag.init()):global.lpTag._tagCount+=1;
    // Function for binding click events to the chat buttons as they appear

    global.lpTag.section = 'azure-leadgen-' + global.lpConfig.culture;
    /* eslint-enable */

    livePersonUserInfo = {
        type: 'personal',
        personal: {
            firstname: global.lpConfig.firstname,
            lastname: global.lpConfig.lastname,
            contacts: [{
                email: global.lpConfig.email
            }],
            company: global.lpConfig.company
        }
    };

    function LogError(errorMsg, context) {
        if (global && global.Core && global.Core.Util && global.Core.Util.TrackException) {
            global.Core.Util.TrackException(errorMsg, context);
        }
    }

    function sendAnalytics(msg, setNonInteraction, target) {
        var props = setNonInteraction ? { nonInteraction: true } : {};
        props.Module = 'chat';

        if (target) {
            props.Target = target;
        }

        if (global.sd && global.sd.analytics && global.sd.analytics.getData) {
            global.sd.analytics.getData(msg, props);
        } else {
            LogError('ACOM analytics is undefined', { msg: msg });
        }
    }

    function initLivePersonChat() {
        if (renderSalesChatButton) {
            renderedLivePersonChatBtn.removeAttribute('disabled');
            renderedLivePersonChatBtn.style.display = 'inline';
            renderedLivePersonChatBtn.addEventListener('click', expandChat);
        }

        livePersonChat.addEventListener('click', expandChat);
        livePersonChat.style.display = 'block';

        document.body.dispatchEvent(global.sd.utilities.createCustomEvent('livechatInit'));
    }

    function expandChat() {
        global.lpTag.sdes.push(livePersonUserInfo);

        global.lpTag.sdes.push({
            type: 'lead',
            lead: {
                topic: 'Azure'
            }
        });
        if (engagementId) {
            livePersonChat.style.display = 'none';
            global.lpTag.taglets.rendererStub.click(engagementId);
            if (isAgentBusy) {
                sendAnalytics('global-liveengagechat-control-expandchatwithbusyagent-chatwindow');
            } else {
                sendAnalytics('global-liveengagechat-control-expandchat-chatwindow');
            }
        } else {
            LogError('LivePerson - engagementId is ' + engagementId);
        }
    }

    global.lpTag.events.bind('lpUnifiedWindow', 'windowClosed', function bindChatWindowClosed() {
        sendAnalytics('global-liveengagechat-control-windowclosed-chatwindow');
    });
    global.lpTag.events.bind('lpUnifiedWindow', 'maximized', function bindChatMaximized() {
        sendAnalytics('global-liveengagechat-control-windowmaximized-chatwindow');
    });
    global.lpTag.events.bind('lpUnifiedWindow', 'minimized', function bindChatMinimized() {
        sendAnalytics('global-liveengagechat-control-windowminimized-chatwindow');
    });
    global.lpTag.events.bind('lpUnifiedWindow', 'state', function bindChatState(event) {
        var eventMsgErr = '';

        if (typeof event.state !== 'undefined') {
            switch (event.state) {
                case 'init':
                    sendAnalytics('global-liveengagechat-control-init-chatwindow');
                    break;
                case 'initialised':
                    sendAnalytics('global-liveengagechat-control-initialized-chatwindow');
                    break;
                case 'resume':
                    sendAnalytics('global-liveengagechat-control-resume-chatwindow');
                    break;
                case 'preChat':
                    sendAnalytics('global-liveengagechat-control-prechat-chatwindow');
                    break;
                case 'waiting':
                    sendAnalytics('global-liveengagechat-control-waiting-chatwindow');
                    break;
                case 'chatting':
                    sendAnalytics('global-liveengagechat-control-chating-chatwindow');
                    break;
                case 'interactive':
                    if (!chatInitiated) {
                        sendChatInitiated();
                    }
                    sendAnalytics('global-liveengagechat-control-interactive-chatwindow');
                    break;
                case 'ended':
                    fireJsll(181);
                    sendAnalytics('global-liveengagechat-control-ended-chatwindow');
                    break;
                case 'postChat':
                    sendAnalytics('global-liveengagechat-control-postchat-chatwindow');
                    break;
                case 'applicationEnded':
                    sendAnalytics('global-liveengagechat-control-applicationended-chatwindow');
                    break;
                case 'offline':
                    sendAnalytics('global-liveengagechat-control-offline-chatwindow');
                    break;
                default:
                    eventMsgErr = typeof event === 'undefined'
                        ? event
                        : JSON.stringify(event);
                    LogError('LivePerson not supported state ' + event.state + ', event is ' + eventMsgErr);
            }
        }
    });

    $('body').on('click', '.lp_action_item', handleChatBtnEvent);
    $('body').on('click', '.lpc_message__text button', handleChatBtnEvent);
    $('body').on('mouseup', '.chips-item', handleChatBtnEvent);
    $('body').on('mouseup', '.lp_buttons_area button', handleChatBtnEvent);

    function handleChatBtnEvent(e) {
        var targetText = e.target.tagName === 'BUTTON'
                ? e.target.textContent
                : $(e.target).parents('button').text(),
            targetSlug = targetText.replace(/ /g, '-').toLowerCase();

        sendAnalytics('global-liveengagechat-control-clicked-button', false, targetText);
        fireJsll('bot-routing-' + targetSlug, targetText);
    }

    function fireJsll(behavior, id) {
        var content = {},
            rightRailExp = document.querySelector('.right-rail--active'),
            an = rightRailExp ? 'contact-widget' : 'chat';

        if (global.awa && global.awa.ct) {
            content.chtid = 'azure chat 1';
            content.chtnm = 'live person chat';
            content.an = an;

            if (id) {
                content.id = id;
            }

            global.awa.ct.captureContentPageAction({
                behavior: behavior,
                content: content
            });

            if (global.oneDsAnalytics) {
                global.oneDsAnalytics.capturePageAction(
                    null,
                    {
                        behavior: behavior,
                        content: content
                    }
                );
            }

            return true;
        }

        return false;
    }

    function sendChatInitiated() {
        if (fireJsll(180)) {
            chatInitiated = true;
        }
    }

    function offerDisplay(en) {
        var container = document.getElementsByClassName('LPMcontainer'),
            rightRailExp = document.querySelector('.right-rail--active'),
            showId = rightRailExp ? 'show-chat-widget' : 'show-chat',
            engagementType = en.engagementType;

        if (container.length > 1) {
            LogError('LivePerson rendered chat extra chat window on the page');
        }

        // Only allow enabling chat elements if the strict mode of browsing is not enabled
        if ((typeof engagementFix !== 'undefined') && (typeof window.lpTag.taglets.lpSecureStorage.getStorageType()['https://lpcdn.lpsnmedia.net'].monitoringSDK !== 'undefined')) {
            fireJsll(14, showId);

            engagementId = en.engagementId;

            if (engagementType === 5) {
                switch (en.state) {
                    case 1: {
                        sendAnalytics('global-liveengagechat-control-showchatwindow-chatwindow',
                            true);
                        initLivePersonChat();
                        // Agents available
                        break;
                    }
                    case 4: {
                        isAgentBusy = true;

                        sendAnalytics('global-liveengagechat-control-agentbusy-chatwindow',
                            true);

                        initLivePersonChat();
                        // Agents busy
                        break;
                    }
                    default: {
                        sendAnalytics('global-liveengagechat-control-agentoffline-chatwindow',
                            true);

                        if (en.state !== 2) {
                            LogError('LivePerson send state what we not support ' + en.state
                                + ', Engagement string ' + JSON.stringify(en));
                        }
                        // state 2 is agents offline, setting as default here.
                        break;
                    }
                }
            } else {
                try {
                    LogError('LivePerson not correct type to check agent, type number is '
                        + engagementType + ', Engagement string ' + JSON.stringify(en));
                } catch (ex) {
                    LogError('LivePerson not correct type to check agent - catch track - '
                        + 'type number is ' + engagementType + ', Engagement string '
                        + JSON.stringify(ex));
                }
            }
        }
    }

    global.lpTag.events.bind('LP_OFFERS', 'OFFER_DISPLAY', offerDisplay);
})(jQuery, window);
