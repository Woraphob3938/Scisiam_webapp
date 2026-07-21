$ErrorActionPreference = 'Stop'

$docx = 'D:\Scisiam_app\output\doc\แผ่นพับ_SciSiam_สำหรับกรรมการ.docx'
$pdf = 'D:\Scisiam_app\tmp\scisiam-brochure.pdf'
$finalPdf = 'D:\Scisiam_app\output\doc\แผ่นพับ_SciSiam_สำหรับกรรมการ.pdf'

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $document = $word.Documents.Open($docx)
    $document.SaveAs2($pdf, 17)
    $document.Close($false)
}
finally {
    $word.Quit()
}

Copy-Item -LiteralPath $pdf -Destination $finalPdf -Force
Write-Output $finalPdf
