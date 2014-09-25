define([

],
function () {

    return Backbone.Model.extend({

        defaults: {
            order: 0,
            selected: false,
            enabled: true,
            displayed: true,
            dataModel: null
        },

        addToSelection: function () {
            this.set('selected', true);
        },

        removeFromSelection: function () {
            this.set('selected', false);
        },

        isSelected: function () {
            return this.get('selected');
        },

        select: function () {
            var oldSelected, i;
            
            oldSelected = this.collection.filter(function (row) {
                return row.get('selected');
            });

            for (i = 0; i < oldSelected.length; i++) {      //Unselect all previous
                oldSelected[i].set('selected', false);
            }

            this.set('selected', true);             //Select this row
        },

        show: function () {
            this.set('displayed', true);
        },

        hide: function () {
            this.removeFromSelection(); // unselect hidden row
            this.set('displayed', false);
        }
    });
});