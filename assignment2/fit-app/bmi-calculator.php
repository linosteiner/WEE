<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $weight = $_POST["weight"];
  $height = $_POST["height"];
  $bmi = $weight / pow(($height / 100), 2);
  $_SESSION["bmi_result"] = round($bmi, 1, PHP_ROUND_HALF_EVEN);
  header("Location: " . $_SERVER["PHP_SELF"]);
  exit;
}
$bmi = $_SESSION["bmi_result"] ?? null;
unset($_SESSION["bmi_result"]);
?>
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <title>BMI Rechner</title>
    <link href="../../global/css/style.css" rel="stylesheet">
    <link href="../../favicon.ico" rel="icon" sizes="any">
    <link href="../../icon.svg" rel="icon" type="image/svg+xml">
    <link href="../../icon.png" rel="apple-touch-icon">
  </head>
  <body>
    <nav id="menu" class="menu">
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="#">BMI Rechner</a></li>
        <li><a href="bmi-categories.html">BMI Kategorien</a></li>
        <li><a href="bmi-statistics.html">BMI Statisiken</a></li>
      </ul>
    </nav>
    <h1>BMI Rechner</h1>
    <form method="post" action="">
      <div>
        <label class="weight" for="weight">Gewicht in kg</label>
        <input type="number"
               name="weight"
               id="weight"
               required
               min="40"
               max="200"
               step="1">
      </div>
      <div>
        <label class="height" for="height">Grösse in cm</label>
        <input type="number"
               name="height"
               id="height"
               required
               min="120"
               max="250"
               step="1">
      </div>
      <input type="submit" value="Berechnen"/>
    </form>
    <?php if ($bmi !== null): ?>
      <div id="result">Ihr BMI ist: <?= htmlspecialchars($bmi) ?></div>
    <?php endif; ?>
  </body>
</html>
