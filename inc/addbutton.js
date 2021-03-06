var wpLink;
(function(e) {
    var h, c, a, f, j, g = {},
        d = {},
        b = ("ontouchend" in document);

    function i() {
        return h.dom.getParent(h.selection.getNode(), "a")
    }
    wpLink = {
        timeToTriggerRiver: 150,
        minRiverAJAXDuration: 200,
        riverBottomThreshold: 5,
        keySensitivity: 100,
        lastSearch: "",
        textarea: "",
        init: function() {
            e("#wp-link .link-target").append('<br>&nbsp;<label class="addbutton"><span>&nbsp;</span><input type="checkbox" id="wpres-add-nofollow">' + wpLinkL10n.noFollow + "</label>");
            //e(".wp-link-text-field").before('<div class="link-title-field"><label><span>' + wpLinkL10n.labelTitle + '</span><input id="wp-link-title" type="text" name="linktitle" /></label></div>');
            e('<style type="text/css"> #wp-link .link-target { overflow: visible !important; } .addbutton { position: relative; top: 2px; } @media only screen and (max-width: 850px) { .addbutton { top: 10px; } } .has-text-field #wp-link .query-results { top: 256px !important; } #wp-link-wrap.search-panel-visible {height: 549px !important;}</style>').appendTo("head");
            g.wrap = e("#wp-link-wrap");
            g.dialog = e("#wp-link");
            g.backdrop = e("#wp-link-backdrop");
            g.submit = e("#wp-link-submit");
            g.close = e("#wp-link-close");
            g.text = e("#wp-link-text");
            g.url = e("#wp-link-url");
            g.nonce = e("#_ajax_linking_nonce");
            g.openInNewTab = e("#wp-link-target");
            g.wpresNofollow = e("#wpres-add-nofollow");
            g.title = e("#wp-link-title");
            g.search = e("#wp-link-search");
            d.search = new a(e("#search-results"));
            d.recent = new a(e("#most-recent-results"));
            d.elements = g.dialog.find(".query-results");
            g.queryNotice = e("#query-notice-message");
            g.queryNoticeTextDefault = g.queryNotice.find(".query-notice-default");
            g.queryNoticeTextHint = g.queryNotice.find(".query-notice-hint");
            g.dialog.keydown(wpLink.keydown);
            g.dialog.keyup(wpLink.keyup);
            g.submit.click(function(l) {
                l.preventDefault();
                wpLink.update()
            });
            g.close.add(g.backdrop).add("#wp-link-cancel a").click(function(l) {
                l.preventDefault();
                wpLink.close()
            });
            e("#wp-link-search-toggle").on("click", wpLink.toggleInternalLinking);
            d.elements.on("river-select", wpLink.updateFields);
            g.search.on("focus.wplink", function() {
                g.queryNoticeTextDefault.hide();
                g.queryNoticeTextHint.removeClass("screen-reader-text").show()
            }).on("blur.wplink", function() {
                g.queryNoticeTextDefault.show();
                g.queryNoticeTextHint.addClass("screen-reader-text").hide()
            });
            g.search.keyup(function() {
                var l = this;
                window.clearTimeout(c);
                c = window.setTimeout(function() {
                    wpLink.searchInternalLinks.call(l)
                }, 500)
            });

            function k() {
                var l = e.trim(g.url.val());
                if (l && j !== l && !/^(?:[a-z]+:|#|\?|\.|\/)/.test(l)) {
                    g.url.val("http://" + l);
                    j = l
                }
            }
            g.url.on("paste", function() {
                setTimeout(k, 0)
            });
            g.url.on("blur", k)
        },
        open: function(l) {
            var k;
            e(document.body).addClass("modal-open");
            wpLink.range = null;
            if (l) {
                window.wpActiveEditor = l
            }
            if (!window.wpActiveEditor) {
                return
            }
            this.textarea = e("#" + window.wpActiveEditor).get(0);
            if (typeof tinymce !== "undefined") {
                k = tinymce.get(wpActiveEditor);
                if (k && !k.isHidden()) {
                    h = k
                } else {
                    h = null
                }
                if (h && tinymce.isIE) {
                    h.windowManager.bookmark = h.selection.getBookmark()
                }
            }
            if (!wpLink.isMCE() && document.selection) {
                this.textarea.focus();
                this.range = document.selection.createRange()
            }
            g.wrap.show();
            g.backdrop.show();
            wpLink.refresh();
            e(document).trigger("wplink-open", g.wrap)
        },
        isMCE: function() {
            return h && !h.isHidden()
        },
        refresh: function() {
            var k = "";
            d.search.refresh();
            d.recent.refresh();
            if (wpLink.isMCE()) {
                wpLink.mceRefresh()
            } else {
                if (!g.wrap.hasClass("has-text-field")) {
                    g.wrap.addClass("has-text-field")
                }
                if (document.selection) {
                    k = document.selection.createRange().text || ""
                } else {
                    if (typeof this.textarea.selectionStart !== "undefined" && (this.textarea.selectionStart !== this.textarea.selectionEnd)) {
                        k = this.textarea.value.substring(this.textarea.selectionStart, this.textarea.selectionEnd) || ""
                    }
                }
                g.text.val(k);
                wpLink.setDefaultValues()
            }
            if (b) {
                g.url.focus().blur()
            } else {
                g.url.focus()[0].select()
            }
            if (!d.recent.ul.children().length) {
                d.recent.ajax()
            }
            j = g.url.val().replace(/^http:\/\//, "")
        },
        hasSelectedText: function(k) {
            var n = h.selection.getContent();
            if (/</.test(n) && (!/^<a [^>]+>[^<]+<\/a>$/.test(n) || n.indexOf("href=") === -1)) {
                return false
            }
            if (k) {
                var l = k.childNodes,
                    m;
                if (l.length === 0) {
                    return false
                }
                for (m = l.length - 1; m >= 0; m--) {
                    if (l[m].nodeType != 3) {
                        return false
                    }
                }
            }
            return true
        },
        mceRefresh: function() {
            var n, m = h.selection.getNode(),
                k = h.dom.getParent(m, "a[href]"),
                l = this.hasSelectedText(k);
            if (k) {
                n = k.innerText || k.textContent;
                g.url.val(h.dom.getAttrib(k, "href"));
                g.openInNewTab.prop("checked", "_blank" === h.dom.getAttrib(k, "target"));
                if (h.dom.getAttrib(k, "class") === "btn") {
                    g.wpresNofollow.prop("checked", true)
                } else {
                    g.wpresNofollow.prop("checked", false)
                }
                g.title.val(h.dom.getAttrib(k, "title"));
                g.submit.val(wpLinkL10n.update)
            } else {
                n = h.selection.getContent({
                    format: "text"
                });
                this.setDefaultValues()
            }
            if (l) {
                g.text.val(n || "");
                g.wrap.addClass("has-text-field")
            } else {
                g.text.val("");
                g.wrap.removeClass("has-text-field")
            }
        },
        close: function() {
            e(document.body).removeClass("modal-open");
            if (!wpLink.isMCE()) {
                wpLink.textarea.focus();
                if (wpLink.range) {
                    wpLink.range.moveToBookmark(wpLink.range.getBookmark());
                    wpLink.range.select()
                }
            } else {
                h.focus()
            }
            g.backdrop.hide();
            g.wrap.hide();
            j = false;
            e(document).trigger("wplink-close", g.wrap)
        },
        getAttrs: function() {
            return {
                href: e.trim(g.url.val()),
                target: g.openInNewTab.prop("checked") ? "_blank" : "",
                class: g.wpresNofollow.prop("checked") ? "btn" : "",
                title: e.trim(g.title.val())
            }
        },
        update: function() {
            if (wpLink.isMCE()) {
                wpLink.mceUpdate()
            } else {
                wpLink.htmlUpdate()
            }
        },
        htmlUpdate: function() {
            var m, r, n, p, l, q, o, k = wpLink.textarea;
            if (!k) {
                return
            }
            m = wpLink.getAttrs();
            r = g.text.val();
            if (!m.href) {
                return
            }
            n = '<a href="' + m.href + '"';
            if (m.target) {
                n += ' target="' + m.target + '"'
            }
            if (m.title) {
                title = m.title.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
                n += ' title="' + title + '"'
            }
            if (m.class) {
                n += ' class="' + m.class + '"'
            }
            n += ">";
            if (document.selection && wpLink.range) {
                k.focus();
                wpLink.range.text = n + (r || wpLink.range.text) + "</a>";
                wpLink.range.moveToBookmark(wpLink.range.getBookmark());
                wpLink.range.select();
                wpLink.range = null
            } else {
                if (typeof k.selectionStart !== "undefined") {
                    p = k.selectionStart;
                    l = k.selectionEnd;
                    o = r || k.value.substring(p, l);
                    n = n + o + "</a>";
                    q = p + n.length;
                    if (p === l && !o) {
                        q -= 4
                    }
                    k.value = (k.value.substring(0, p) + n + k.value.substring(l, k.value.length));
                    k.selectionStart = k.selectionEnd = q
                }
            }
            wpLink.close();
            k.focus()
        },
        mceUpdate: function() {
            var k = wpLink.getAttrs(),
                l, m;
            wpLink.close();
            h.focus();
            if (tinymce.isIE) {
                h.selection.moveToBookmark(h.windowManager.bookmark)
            }
            if (!k.href) {
                h.execCommand("unlink");
                return
            }
            l = i();
            m = g.text.val();
            if (l) {
                if (m) {
                    if ("innerText" in l) {
                        l.innerText = m
                    } else {
                        l.textContent = m
                    }
                }
                h.dom.setAttribs(l, k)
            } else {
                if (m) {
                    h.selection.setNode(h.dom.create("a", k, m))
                } else {
                    h.execCommand("mceInsertLink", false, k)
                }
            }
        },
        updateFields: function(l, k) {
            g.url.val(k.children(".item-permalink").val());
            g.title.val(k.hasClass("no-title") ? "" : k.children(".item-title").text())
        },
        setDefaultValues: function() {
            var m, l = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                k = /^(https?|ftp):\/\/[A-Z0-9.-]+\.[A-Z]{2,4}[^ "]*$/i;
            if (this.isMCE()) {
                m = h.selection.getContent()
            } else {
                if (document.selection && wpLink.range) {
                    m = wpLink.range.text
                } else {
                    if (typeof this.textarea.selectionStart !== "undefined") {
                        m = this.textarea.value.substring(this.textarea.selectionStart, this.textarea.selectionEnd)
                    }
                }
            }
            if (m && l.test(m)) {
                g.url.val("mailto:" + m)
            } else {
                if (m && k.test(m)) {
                    g.url.val(m.replace(/&amp;|&#0?38;/gi, "&"))
                } else {
                    g.title.val("");
                    g.url.val("")
                }
            }
            g.submit.val(wpLinkL10n.save)
        },
        searchInternalLinks: function() {
            var l = e(this),
                m, k = l.val();
            if (k.length > 2) {
                d.recent.hide();
                d.search.show();
                if (wpLink.lastSearch == k) {
                    return
                }
                wpLink.lastSearch = k;
                m = l.parent().find(".spinner").addClass("is-active");
                d.search.change(k);
                d.search.ajax(function() {
                    m.removeClass("is-active")
                })
            } else {
                d.search.hide();
                d.recent.show()
            }
        },
        next: function() {
            d.search.next();
            d.recent.next()
        },
        prev: function() {
            d.search.prev();
            d.recent.prev()
        },
        keydown: function(m) {
            var l, n, k = e.ui.keyCode;
            if (k.ESCAPE === m.keyCode) {
                wpLink.close();
                m.stopImmediatePropagation()
            } else {
                if (k.TAB === m.keyCode) {
                    n = m.target.id;
                    if (n === "wp-link-submit" && !m.shiftKey) {
                        g.close.focus();
                        m.preventDefault()
                    } else {
                        if (n === "wp-link-close" && m.shiftKey) {
                            g.submit.focus();
                            m.preventDefault()
                        }
                    }
                }
            }
            if (m.keyCode !== k.UP && m.keyCode !== k.DOWN) {
                return
            }
            if (document.activeElement && (document.activeElement.id === "link-title-field" || document.activeElement.id === "url-field")) {
                return
            }
            l = m.keyCode === k.UP ? "prev" : "next";
            clearInterval(wpLink.keyInterval);
            wpLink[l]();
            wpLink.keyInterval = setInterval(wpLink[l], wpLink.keySensitivity);
            m.preventDefault()
        },
        keyup: function(l) {
            var k = e.ui.keyCode;
            if (l.which === k.UP || l.which === k.DOWN) {
                clearInterval(wpLink.keyInterval);
                l.preventDefault()
            }
        },
        delayedCallback: function(m, k) {
            var p, o, n, l;
            if (!k) {
                return m
            }
            setTimeout(function() {
                if (o) {
                    return m.apply(l, n)
                }
                p = true
            }, k);
            return function() {
                if (p) {
                    return m.apply(this, arguments)
                }
                n = arguments;
                l = this;
                o = true
            }
        },
        toggleInternalLinking: function(k) {
            var l = g.wrap.hasClass("search-panel-visible");
            g.wrap.toggleClass("search-panel-visible", !l);
            setUserSetting("wplink", l ? "0" : "1");
            g[!l ? "search" : "url"].focus();
            k.preventDefault()
        }
    };
    a = function(m, l) {
        var k = this;
        this.element = m;
        this.ul = m.children("ul");
        this.contentHeight = m.children("#link-selector-height");
        this.waiting = m.find(".river-waiting");
        this.change(l);
        this.refresh();
        e("#wp-link .query-results, #wp-link #link-selector").scroll(function() {
            k.maybeLoad()
        });
        m.on("click", "li", function(n) {
            k.select(e(this), n)
        })
    };
    e.extend(a.prototype, {
        refresh: function() {
            this.deselect();
            this.visible = this.element.is(":visible")
        },
        show: function() {
            if (!this.visible) {
                this.deselect();
                this.element.show();
                this.visible = true
            }
        },
        hide: function() {
            this.element.hide();
            this.visible = false
        },
        select: function(l, o) {
            var n, m, p, k;
            if (l.hasClass("unselectable") || l == this.selected) {
                return
            }
            this.deselect();
            this.selected = l.addClass("selected");
            n = l.outerHeight();
            m = this.element.height();
            p = l.position().top;
            k = this.element.scrollTop();
            if (p < 0) {
                this.element.scrollTop(k + p)
            } else {
                if (p + n > m) {
                    this.element.scrollTop(k + p - m + n)
                }
            }
            this.element.trigger("river-select", [l, o, this])
        },
        deselect: function() {
            if (this.selected) {
                this.selected.removeClass("selected")
            }
            this.selected = false
        },
        prev: function() {
            if (!this.visible) {
                return
            }
            var k;
            if (this.selected) {
                k = this.selected.prev("li");
                if (k.length) {
                    this.select(k)
                }
            }
        },
        next: function() {
            if (!this.visible) {
                return
            }
            var k = this.selected ? this.selected.next("li") : e("li:not(.unselectable):first", this.element);
            if (k.length) {
                this.select(k)
            }
        },
        ajax: function(n) {
            var l = this,
                m = this.query.page == 1 ? 0 : wpLink.minRiverAJAXDuration,
                k = wpLink.delayedCallback(function(o, p) {
                    l.process(o, p);
                    if (n) {
                        n(o, p)
                    }
                }, m);
            this.query.ajax(k)
        },
        change: function(k) {
            if (this.query && this._search == k) {
                return
            }
            this._search = k;
            this.query = new f(k);
            this.element.scrollTop(0)
        },
        process: function(l, p) {
            var m = "",
                n = true,
                k = "",
                o = p.page == 1;
            if (!l) {
                if (o) {
                    m += '<li class="unselectable no-matches-found"><span class="item-title"><em>' + wpLinkL10n.noMatchesFound + "</em></span></li>"
                }
            } else {
                e.each(l, function() {
                    k = n ? "alternate" : "";
                    k += this.title ? "" : " no-title";
                    m += k ? '<li class="' + k + '">' : "<li>";
                    m += '<input type="hidden" class="item-permalink" value="' + this.permalink + '" />';
                    m += '<span class="item-title">';
                    m += this.title ? this.title : wpLinkL10n.noTitle;
                    m += '</span><span class="item-info">' + this.info + "</span></li>";
                    n = !n
                })
            }
            this.ul[o ? "html" : "append"](m)
        },
        maybeLoad: function() {
            var l = this,
                m = this.element,
                k = m.scrollTop() + m.height();
            if (!this.query.ready() || k < this.contentHeight.height() - wpLink.riverBottomThreshold) {
                return
            }
            setTimeout(function() {
                var n = m.scrollTop(),
                    o = n + m.height();
                if (!l.query.ready() || o < l.contentHeight.height() - wpLink.riverBottomThreshold) {
                    return
                }
                l.waiting.addClass("is-active");
                m.scrollTop(n + l.waiting.outerHeight());
                l.ajax(function() {
                    l.waiting.removeClass("is-active")
                })
            }, wpLink.timeToTriggerRiver)
        }
    });
    f = function(k) {
        this.page = 1;
        this.allLoaded = false;
        this.querying = false;
        this.search = k
    };
    e.extend(f.prototype, {
        ready: function() {
            return !(this.querying || this.allLoaded)
        },
        ajax: function(m) {
            var k = this,
                l = {
                    action: "wp-link-ajax",
                    page: this.page,
                    _ajax_linking_nonce: g.nonce.val()
                };
            if (this.search) {
                l.search = this.search
            }
            this.querying = true;
            e.post(ajaxurl, l, function(n) {
                k.page++;
                k.querying = false;
                k.allLoaded = !n;
                m(n, l)
            }, "json")
        }
    });
    e(document).ready(wpLink.init)
})(jQuery);
