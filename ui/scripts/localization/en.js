define(function(require) {

  var datePickerTranslation= {
    closeText: 'Sulje',
    prevText: '&laquo;Edellinen',
    nextText: 'Seuraava&raquo;',
    currentText: 'T&auml;n&auml;&auml;n',
    monthNames: ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kes&auml;kuu',
                 'Hein&auml;kuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'],
    monthNamesShort: ['Tammi','Helmi','Maalis','Huhti','Touko','Kes&auml;',
                      'Hein&auml;','Elo','Syys','Loka','Marras','Joulu'],
    dayNamesShort: ['Su','Ma','Ti','Ke','To','Pe','Su'],
    dayNames: ['Sunnuntai','Maanantai','Tiistai','Keskiviikko','Torstai','Perjantai','Lauantai'],
    dayNamesMin: ['Su','Ma','Ti','Ke','To','Pe','La'],
    weekHeader: 'Vk',
    dateFormat: 'dd.mm.yy',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
  };

  var lang = {
    'receipt.productname'     : 'Product name',
    'receipt.purchasedate'    : 'Purchase date',
    'receipt.guaranteedate'   : 'Warrantly Ends',
    'receipt.store'           : 'Store',
    'receipt.price'           : 'Product price',
    'receipt.registered'      : 'Registered',
    'receipt.description'     : 'Description',
    'receipt.noimages'        : 'No images available',
    'receipt.images'          : 'Images',
    'receipt.keywords'        : 'Keywords',
    'receipt.purchaced-since' : 'Purchased {{fromPurchase}} ago',
    'receipt.age'             : 'y [year] d [day]',
    'btn.edit'                : 'Edit',
    'btn.copy'                : 'Copy',
    'btn.delete'              : 'Delete',
    'btn.save'                : 'Save',
    'btn.cancel'              : 'Cancel',
    'btn.back'                : 'Back',
    'main-menu.sign-in'       : 'Sign in',
    'main-menu.sign-out'      : 'Sign out {{username}}',
    'main-menu.receipts'      : 'Receipts',
    'main-menu.reports'       : 'Reports',
    'main-menu.title'         : 'Kuittipankki',
    'receipt-list.sort.name'  : 'Name',
    'receipt-list.sort.date'  : 'Date',
    'receipt-list.new-receipt': 'New',
    'receipt-list.no-receipts': 'No receipts available',
    'user.dialog.title'       : 'User Settings',
    'user.language'           : 'Translation',
    'user.language.fi'        : 'Finnish',
    'user.language.en'        : 'English',
    'report.totalcount'       : 'Receipt total count {{count}}',
    'report.export.csv'       : 'Export as CSV',
    'report.export.json'      : 'Export as JSON'
  };


  return {
    datePickerTranslation: datePickerTranslation,
    lang: lang
  };

});
