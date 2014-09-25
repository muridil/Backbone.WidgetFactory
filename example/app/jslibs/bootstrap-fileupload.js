/* ===========================================================
 * bootstrap-fileupload.js j2
 * http://jasny.github.com/bootstrap/javascript.html#fileupload
 * ===========================================================
 * Copyright 2012 Jasny BV, Netherlands.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

    "use strict"; // jshint ;_

    /* FILEUPLOAD PUBLIC CLASS DEFINITION
    * ================================= */

    var Fileupload = function (element, options) {
        this.$element = $(element)

        //this.type = this.$element.data('uploadtype') || (this.$element.find('.thumbnail').length > 0 ? "image" : "file")
        this.type = undefined;

        // Set type
        if(this.$element.find('.thumbnail').length > 0) {
            this.type = "image";
        }
        else if(this.$element.find('.bigfile').length > 0) {
            this.type = "bigfile";
        }
        else {
            this.type = "file";
        }

        this.$input = this.$element.find(':file')
        if (this.$input.length === 0) return
        
        this.name = this.$input.attr('name') || options.name

        // Hidden data
        this.$hidden = this.$element.find('input[type=hidden][name="' + this.name + '"]')
        if (this.$hidden.length === 0) {
            this.$hidden = $('<input type="hidden" />')
            this.$element.prepend(this.$hidden)
        }

        // Hidden attributes
        this.$hiddenName = this.$element.find('input[type=hidden][name="' + this.name + 'Name"]')
        this.$hiddenSize = this.$element.find('input[type=hidden][name="' + this.name + 'Size"]')
        this.$hiddenType = this.$element.find('input[type=hidden][name="' + this.name + 'Type"]')

        this.$preview = this.$element.find('.fileupload-preview')
        this.$filename = this.$element.find('.fileupload-filename')

        var height = this.$preview.css('height')
        if (this.$preview.css('display') != 'inline' && height != '0px' && height != 'none') this.$preview.css('line-height', height)

        this.original = {
            'exists': this.$element.hasClass('fileupload-exists'),
            'preview': this.$preview.html(),
            'filename': this.$filename.html(),
            'hiddenVal': this.$hidden.val(),
            'hiddenNameVal': this.$hiddenName.val(),
            'hiddenSizeVal': this.$hiddenSize.val(),
            'hiddenTypeVal': this.$hiddenType.val(),
        }

        this.$remove = this.$element.find('[data-dismiss="fileupload"]')

        this.$element.find('[data-trigger="fileupload"]').on('click.fileupload', $.proxy(this.trigger, this))

        this.listen()
    }

    Fileupload.prototype = {

        listen: function () {
            this.$input.on('change.fileupload', $.proxy(this.change, this))
            $(this.$input[0].form).on('reset.fileupload', $.proxy(this.reset, this))
            if (this.$remove) this.$remove.on('click.fileupload', $.proxy(this.clear, this))
        },

        change: function (e, invoked) {
            if (invoked === 'clear') return

            var file = e.target.files !== undefined ? e.target.files[0] : (e.target.value ? { name: e.target.value.replace(/^.+\\/, '')} : null)

            if (!file) {
                this.clear()
                return
            }

            this.$hidden.val('');
            this.$hidden.attr('name', '');

            // Set image attributes
            this.$hiddenName.val('');
            this.$hiddenName.attr('name', 'Name');
            this.$hiddenSize.val('');
            this.$hiddenSize.attr('name', 'Size');
            this.$hiddenType.val('');
            this.$hiddenType.attr('name', 'Type');

            this.$input.attr('name', this.name)

            // IMAGE
            if (this.type === "image" && this.$preview.length > 0 && (typeof file.type !== "undefined" ? file.type.match('image.*') : file.name.match(/\.(gif|png|jpe?g)$/i)) && typeof FileReader !== "undefined") {
                var reader = new FileReader()
                var preview = this.$preview
                var element = this.$element

                var hidden = this.$hidden; // MetaIT MODIFICATION
                var hiddenName = this.$hiddenName; // MetaIT MODIFICATION
                var hiddenSize = this.$hiddenSize; // MetaIT MODIFICATION
                var hiddenType = this.$hiddenType; // MetaIT MODIFICATION

                reader.onload = function (e) {
                    preview.html('<img src="' + e.target.result + '" ' + (preview.css('max-height') != 'none' ? 'style="max-height: ' + preview.css('max-height') + ';"' : '') + ' />')
                    
                    // Set hidden values
                    hiddenName.val(file.name.replace(/\;/g, '').replace(/\,/g, '').replace(/\|/g, '').replace(/\"/g, '').replace(/\'/g, ''));
                    hiddenSize.val(file.size);
                    hiddenType.val(file.type);
                    hidden.val(e.target.result).change();
                    
                    // Update model in backbone
                    //hidden.change(); // MetaIT MODIFICATION

                    element.addClass('fileupload-exists').removeClass('fileupload-new')
                }

                reader.readAsDataURL(file)
            }
            // FILE
            else if (this.type === "file" && this.$filename.length > 0 && typeof file.type !== "undefined" && typeof FileReader !== "undefined") {
                var reader = new FileReader()
                var filename = this.$filename
                var element = this.$element

                var hidden = this.$hidden;
                var hiddenName = this.$hiddenName; // MetaIT MODIFICATION
                var hiddenSize = this.$hiddenSize; // MetaIT MODIFICATION
                var hiddenType = this.$hiddenType; // MetaIT MODIFICATION

                reader.onload = function (e) {
                    filename.html(file.name);

                    // Set hidden values
                    hiddenName.val(file.name.replace(/\;/g, '').replace(/\,/g, '').replace(/\|/g, '').replace(/\"/g, '').replace(/\'/g, ''));
                    hiddenSize.val(file.size);
                    hiddenType.val(file.type);
                    hidden.val(e.target.result).change();
                    
                    // Update model in backbone
                    //hidden.change(); // MetaIT MODIFICATION

                    element.addClass('fileupload-exists').removeClass('fileupload-new')
                }

                reader.readAsDataURL(file)
            }
            // BIG FILE
            else if (this.type === "bigfile" && this.$filename.length > 0 && typeof file.type !== "undefined" && typeof FileReader !== "undefined") {
                var filename = this.$filename
                var element = this.$element

                var hidden = this.$hidden;
                var hiddenName = this.$hiddenName; // MetaIT MODIFICATION
                var hiddenSize = this.$hiddenSize; // MetaIT MODIFICATION
                var hiddenType = this.$hiddenType; // MetaIT MODIFICATION

                filename.html(file.name);

                // Set hidden values
                hidden.val(file.name);
                hiddenName.val(file.name.replace(/\;/g, '').replace(/\,/g, '').replace(/\|/g, '').replace(/\"/g, '').replace(/\'/g, ''));
                hiddenSize.val(file.size);
                hiddenType.val(file.type);

                hidden.change(); // MetaIT MODIFICATION

                element.addClass('fileupload-exists').removeClass('fileupload-new')
            }
            else {
                this.$preview.text(file.name)
                this.$element.addClass('fileupload-exists').removeClass('fileupload-new')
            }
        },

        clear: function (e) {
            this.$hidden.val('')
            this.$hidden.attr('name', this.name)
            
            this.$hiddenName.val('')
            this.$hiddenName.attr('name', this.name + "Name")
            this.$hiddenSize.val('')
            this.$hiddenSize.attr('name', this.name + "Size")
            this.$hiddenType.val('')
            this.$hiddenType.attr('name', this.name + "Type")
            
            this.$hidden.change(); // MetaIT MODIFICATION
            this.$input.attr('name', '')

            //ie8+ doesn't support changing the value of input with type=file so clone instead
            if (navigator.userAgent.match(/msie/i)) {
                var inputClone = this.$input.clone(true);
                this.$input.after(inputClone);
                this.$input.remove();
                this.$input = inputClone;
            } else {
                this.$input.val('')
            }

            this.$preview.html('')
            this.$filename.html('')
            this.$element.addClass('fileupload-new').removeClass('fileupload-exists')

            if (e) {
                this.$input.trigger('change', ['clear'])
                e.preventDefault()
            }
        },

        reset: function (e) {
            this.clear()

            this.$hidden.val(this.original.hiddenVal)
            this.$hiddenName.val(this.original.hiddenNameVal)
            this.$hiddenSize.val(this.original.hiddenSizeVal)
            this.$hiddenType.val(this.original.hiddenTypeVal)
            this.$preview.html(this.original.preview)
            this.$filename.html(this.original.filename)

            if (this.original.exists) this.$element.addClass('fileupload-exists').removeClass('fileupload-new')
            else this.$element.addClass('fileupload-new').removeClass('fileupload-exists')
        },

        trigger: function (e) {
            this.$input.trigger('click')
            e.preventDefault()
        }
    }


    /* FILEUPLOAD PLUGIN DEFINITION
    * =========================== */

    $.fn.fileupload = function (options) {
        return this.each(function () {
            var $this = $(this)
      , data = $this.data('fileupload')
            if (!data) $this.data('fileupload', (data = new Fileupload(this, options)))
            if (typeof options == 'string') data[options]()
        })
    }

    $.fn.fileupload.Constructor = Fileupload


    /* FILEUPLOAD DATA-API
    * ================== */

    $(document).on('click.fileupload.data-api', '[data-provides="fileupload"]', function (e) {
        var $this = $(this)
        if ($this.data('fileupload')) return
        $this.fileupload($this.data())

        var $target = $(e.target).closest('[data-dismiss="fileupload"],[data-trigger="fileupload"]');
        if ($target.length > 0) {
            $target.trigger('click.fileupload')
            e.preventDefault()
        }
    })


} (window.jQuery);
