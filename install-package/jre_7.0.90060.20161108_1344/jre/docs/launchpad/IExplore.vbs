Sub writeBinaryFileHelper(FileName, Contents) 
	Dim I, byteArray, binaryStream, textStream
	Set binaryStream= CreateObject("ADODB.Stream") 
	binaryStream.Type = 1: binaryStream.Open 
	Set textStream = CreateObject("ADODB.Stream") 
	textStream.Type = 2 
	textStream.Open

	Size = Len(Contents)
	For I = 1 to Size step 2
		textStream.WriteText ChrB("&H" & Mid(Contents, I, 2))
	Next
	
	textStream.Position = 2
	textStream.CopyTo binaryStream
	textStream.Close 
	binaryStream.SaveToFile FileName, 2
	binaryStream.Close 
	Set textSTream = Nothing
	Set binaryStream= Nothing 
End Sub 
