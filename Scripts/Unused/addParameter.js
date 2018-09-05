function addParameter(pamaremeters, key, value)
{
if(key != null)
{
if(value == null)
{
value = "";
}

pamaremeters.put(key, value);
}
}


/* ---------------------------------------------------------------------------- */
/* Added by FJB 07-27-15    Modified 12-8-15 to pass the current Cap id. This allows using the County code from the parent CAP */
