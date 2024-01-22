define(['jquery'], function ($) {
  var CustomWidget = function () {
    var self = this;

    this.callbacks = {
      render: function () {
        return true;
      },
      init: function () {
        self.addSummationLogic();
        return true;
      },
      bind_actions: function () {
        return true;
      },
      settings: function () {
        self.renderSettings();
        return true;
      },
      onSave: function () {
        self.saveSettings();
        return true;
      },
      destroy: function () {
      },
      advancedSettings: function () {
        self.renderSettings();
      }
    };

    this.renderSettings = function () {
      const $settings = $('#widget_settings__fields_wrapper');
      const settingsHtml = `
        <style>
          .widget_settings_block__item_field {
            margin-bottom: 10px;
          }
          .widget_settings_block__item_field label {
            display: block;
            margin-bottom: 5px;
          }
          .widget_settings_block__item_field select {
            width: 100%;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .button-input {
            background-color: #2a85ff;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .button-input:hover {
            background-color: #1b74e4;
          }
        </style>
        <div class="widget_settings_block__item_field">
          <label for="addendA_field">Поле для слагаемого А:</label>
          <select id="addendA_field" name="addendA_field"></select>
        </div>
        <div class="widget_settings_block__item_field">
          <label for="addendB_field">Поле для слагаемого Б:</label>
          <select id="addendB_field" name="addendB_field"></select>
        </div>
        <div class="widget_settings_block__item_field">
          <label for="sum_field">Поле для результата:</label>
          <select id="sum_field" name="sum_field"></select>
        </div>
        <button type="button" id="save_settings" class="button-input">Сохранить</button>
      `;
      $settings.html(settingsHtml);

      const fields = AMOCRM.constant('account').cf;
      for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
          const field = fields[key];
          const option = $('<option>').val(field.ID).text(field.NAME);
          $('#addendA_field, #addendB_field, #sum_field').append(option);
        }
      }

      $('#addendA_field').val(self.get_settings().addendA_field);
      $('#addendB_field').val(self.get_settings().addendB_field);
      $('#sum_field').val(self.get_settings().sum_field);

      $('#save_settings').on('click', function () {
        self.saveSettings();
      });
    };

    this.saveSettings = function () {
      const addendA_field = $('#addendA_field').val();
      const addendB_field = $('#addendB_field').val();
      const sum_field = $('#sum_field').val();

      if (!addendA_field || !addendB_field || !sum_field) {
        alert('Ошибка: Все поля должны быть выбраны.');
        return;
      }

      if (addendA_field === addendB_field || addendA_field === sum_field || addendB_field === sum_field) {
        alert('Ошибка: Поля должны быть различны.');
        return;
      }

      const settings = {
        addendA_field: addendA_field,
        addendB_field: addendB_field,
        sum_field: sum_field
      };

      self.set_settings(settings);
      alert('Настройки сохранены.');
    };

    this.addSummationLogic = function () {
      $(document).off('input', '.card-entity-form .js-control-allow-numeric-negative').on('input', '.card-entity-form .js-control-allow-numeric-negative', function (e) {
        var target = $(e.target);
        var fieldName = target.attr('NAME');
        if (fieldName === "CFV[" + self.get_settings().addendA_field + "]" ||
          fieldName === "CFV[" + self.get_settings().addendB_field + "]") {

          let addendAField = $('input[name="CFV[' + self.get_settings().addendA_field + ']"]').val();
          let addendBField = $('input[name="CFV[' + self.get_settings().addendB_field + ']"]').val();

          addendAField = isValidNumber(addendAField) ? parseFloat(addendAField) : 0;
          addendBField = isValidNumber(addendBField) ? parseFloat(addendBField) : 0;

          if (isValidSum(addendAField, addendBField)) {
            let sum = addendAField + addendBField;
            $('input[name="CFV[' + self.get_settings().sum_field + ']"]').val(sum);
          } else {
            alert("Ошибка: Сумма значений превышает допустимый предел.");
          }
        }
      });
    };

    function isValidNumber(value) {
      const number = parseFloat(value);
      return !isNaN(number) && isFinite(number) && number <= Number.MAX_SAFE_INTEGER;
    }

    function isValidSum(addendA, addendB) {
      return (addendA + addendB) <= Number.MAX_SAFE_INTEGER;
    }

    return this;
  };

  return CustomWidget;
});
