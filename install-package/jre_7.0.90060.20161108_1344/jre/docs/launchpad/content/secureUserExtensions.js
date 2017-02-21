<script>

//Define secure user functions here
function secureGetJavaPlatform( securityCheck )
{
  if (!top.isSecure(userSecurityCheck)) { //if the security check fails, bail out 
      return null; 
  }
  var platFile = top.getNativeFileName(top.STARTINGDIR + top.CONTENTDIR + 'platform');
  return top.secureReadTextFile( securityCheck, platFile ); 
}

</script>
