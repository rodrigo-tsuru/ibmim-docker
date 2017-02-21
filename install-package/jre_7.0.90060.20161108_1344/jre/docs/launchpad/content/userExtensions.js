<script>

//This check can be passed as an argument to an secure functions 
//in the API that you call or any secure functions you define in
//secureUserExtensions.js
var userSecurityCheck = new Function('return window');

// To use this funtion in your content, you must refer to it as top.myFunc()

function launchpadStartup()
{
  top.JPLATFORM = secureGetJavaPlatform( userSecurityCheck );
}

function parse(s)
{
  s = s.replace("[plat]", top.JPLATFORM);
  s = s.replace("[locale]", top.LOCALE);
  return s;
}

function shouldShowLicense() 
{ 
  var path = findFileInPaths(null, ['content/'+top.LOCALE, 'content/'+property('fallBackLocale')], top.parse(property('license_file')));
  if (!path) path = findFileInPaths(null, ['content/'+top.LOCALE, 'content/'+property('fallBackLocale')], top.parse(property('license_file_en')));

  return path != null; 
}

function shouldShowNotices() 
{ 
  var path = findFileInPaths(null, ['content/'+top.LOCALE, 'content/'+property('fallBackLocale'), '..'], top.parse(property('notices_file')));

  return path != null; 
}

function shouldShowApidoc()
{
  if ( top.directoryExists( null, top.CONTENTDIR + "apidoc" ) ) { return true; }
  if ( top.compressedApidocFile( ) != null ) { return true; }
  return false;
}

function compressedApidocFile()
{
  if ( top.findFileInPaths( null, ['content/'], "apidoc.zip" ) != null ) { return "apidoc.zip"; }
  if ( top.findFileInPaths( null, ['content/'], "apidoc.tgz" ) != null ) { return "apidoc.tgz"; }
  if ( top.findFileInPaths( null, ['content/'], "apidoc.tar.gz" ) != null ) { return "apidoc.tar.gz"; }
  if ( top.findFileInPaths( null, ['content/'], "apidoc.tar.Z" ) != null ) { return "apidoc.tar.Z"; }
  if ( top.findFileInPaths( null, ['content/'], "apidoc.pax.Z" ) != null ) { return "apidoc.pax.Z"; }
  return null;
}

</script>
