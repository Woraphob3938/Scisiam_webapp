param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $document = $word.Documents.Open($InputPath, $false, $true)
    $pages = $document.ComputeStatistics(2)
    Write-Output "Pages: $pages"
    $document.ExportAsFixedFormat($OutputPath, 17, $false, 0, 0, 1, $pages, 0, $true, $true, 0, $true, $true, $false)
    $document.Close($false)
}
finally {
    $word.Quit()
}

Write-Output $OutputPath
