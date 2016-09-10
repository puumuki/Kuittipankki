// tests/part1/cart-summary-test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var proxyquire =  require('proxyquire').noCallThru();

var winston = require('winston');
 
var fileService = proxyquire('../file-service',{
    './logging': {}
}); 

describe('Testing mimetypes', function() {
  it('image/png', function() {
    
    var filename = '014c902a-3cad-4465-9277-d0c3646f2d56.VyWnEUKj-.png';
    var mimeType = 'image/png';
    var response = fileService.getFileTypeThumbnail(mimeType, filename);

    expect(response).to.equal('thumbnail.014c902a-3cad-4465-9277-d0c3646f2d56.VyWnEUKj-.png'); 
  });

  it('application/pdf', function() {
    
    var filename = '014c902a-3cad-4465-9277-d0c3646f2d56.VyWnEUKj-.png';
    var mimeType = 'application/pdf';
    var response = fileService.getFileTypeThumbnail(mimeType, filename);

    expect(response).to.equal('thumbnail.pdf.svg'); 
  });

  it('application/txt', function() {
    
    var filename = '014c902a-3cad-4465-9277-d0c3646f2d56.VyWnEUKj-.txt';
    var mimeType = 'application/txt';
    var response = fileService.getFileTypeThumbnail(mimeType, filename);

    expect(response).to.equal('thumbnail.txt.svg'); 
  });  

  it('Unrecognized mime type', function() {
    
    var filename = '014c902a-3cad-4465-9277-d0c3646f2d56.VyWnEUKj-.wav';
    var mimeType = 'application/wav';
    var response = fileService.getFileTypeThumbnail(mimeType, filename);

    expect(response).to.equal('thumbnail.default.svg'); 
  });

  it('Mimetype null should return default thumbnail', function() {
    
    var filename = '014c902a-3cad-4465-9277-d0c3646f2d56.VyWnEUKj-.wav';
    var mimeType = null;
    var response = fileService.getFileTypeThumbnail(mimeType, filename);

    expect(response).to.equal('thumbnail.default.svg'); 
  });

  it('Filename null should return default thumbnail', function() {
    
    var filename = null;
    var mimeType = 'application/pdf';
    var response = fileService.getFileTypeThumbnail(mimeType, filename);

    expect(response).to.equal('thumbnail.default.svg'); 
  });         

    it('Crazy stuff should return default thumbnail', function() {
    
    var filename = 'sdfasdfasdfa';
    var mimeType = 'asadfasdfsadf';
    var response = fileService.getFileTypeThumbnail(mimeType, filename);

    expect(response).to.equal('thumbnail.default.svg'); 
  });        

});